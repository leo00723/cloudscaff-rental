/* eslint-disable @typescript-eslint/naming-convention */
import { Component, inject, OnInit } from '@angular/core';
import { arrayUnion, increment, orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import * as Papa from 'papaparse';
import { Observable, lastValueFrom, map, take } from 'rxjs';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddShipmentComponent } from 'src/app/components/add-shipment/add-shipment.component';
import { AddStockitemComponent } from 'src/app/components/add-stockitem/add-stockitem.component';
import { AddTransferComponent } from 'src/app/components/add-transfer/add-transfer.component';
import { CalculatePipe } from 'src/app/components/calculate.pipe';
import { DuplicateStockItemComponent } from 'src/app/components/duplicate-stock-item/duplicate-stock-item.component';
import { TransactionAdjustmentComponent } from 'src/app/components/transaction-adjustment/transaction-adjustment.component';
import { TransactionReturnComponent } from 'src/app/components/transaction-return/transaction-return.component';
import { ViewStockLocationsComponent } from 'src/app/components/view-stock-locations/view-stock-locations.component';
import { ViewStockLogComponent } from 'src/app/components/view-stock-log/view-stock-log.component';
import { Company } from 'src/app/models/company.model';
import { Delivery } from 'src/app/models/delivery.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Request } from 'src/app/models/request.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { Transfer } from 'src/app/models/transfer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styles: [
    `
      ::-webkit-scrollbar {
        width: 0.2rem;
        height: 0rem;
      }
    `,
  ],
})
export class InventoryPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  inventoryItems$: Observable<InventoryItem[]>;

  shipments$: Observable<Delivery[]>;
  pendingShipments$: Observable<Delivery[]>;
  outboundShipments$: Observable<Delivery[]>;
  reservedShipments$: Observable<Delivery[]>;
  voidShipments$: Observable<Delivery[]>;

  transfers$: Observable<Transfer[]>;
  pendingTransfers$: Observable<Transfer[]>;

  requests$: Observable<Request[]>;
  submittedRequests$: Observable<Request[]>;
  partialRequests$: Observable<Request[]>;

  returns$: Observable<TransactionReturn[]>;
  submittedReturns$: Observable<TransactionReturn[]>;
  outboundReturns$: Observable<TransactionReturn[]>;
  voidReturns$: Observable<TransactionReturn[]>;

  active = 1;
  importing = false;
  bulkAdd = false;
  uploading = false;
  bulkAddUploading = false;
  uploadCounter = 0;
  uploadTotal = 0;

  siteStockList = [];
  allSites = [];

  matrix = [];
  items = [];
  sites = [];

  private calcPipe = inject(CalculatePipe);
  protected company: Company;

  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    const page = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    this.active = page >= 1 && page <= 6 ? page : 1;
  }
  ngOnInit() {
    this.init();
  }

  onBulkAddChanged(event) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const file: File = event.target.files[0];
      const user = this.masterSvc.store().selectSnapshot(UserState.user);

      if (file) {
        Papa.parse(file, {
          header: true,
          worker: true,
          dynamicTyping: true,

          complete: async (result) => {
            this.bulkAddUploading = true;
            const data = result.data
              .filter((item) => item.editQty != null)
              .map((item) => ({
                id: item.id,
                yardQty: increment(+item.editQty),
                availableQty: increment(+item.editQty),
                log: arrayUnion({
                  message: `${item.editQty > 0 ? 'Added' : 'Removed'} ${
                    item.editQty
                  } items to the yard.`,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image || '',
                  },
                  date: new Date(),
                  status: item.editQty > 0 ? 'add' : 'remove',
                  comment: 'Imported',
                }),
              }));
            const company = this.masterSvc
              .store()
              .selectSnapshot(CompanyState.company).id;
            this.uploadCounter = 0;
            this.uploadTotal = data.length || 0;
            const batch = this.masterSvc.edit().batch();
            for (const item of data) {
              try {
                const doc = this.masterSvc
                  .edit()
                  .docRef(`company/${company}/stockItems`, item.id);
                batch.update(doc, item);
              } catch (error) {
                console.log(error);
              } finally {
                this.uploadCounter++;
              }
            }
            await batch.commit();

            if (this.uploadCounter === this.uploadTotal) {
              this.bulkAdd = false;
              this.bulkAddUploading = false;
              this.masterSvc
                .notification()
                .toast('Import Successful', 'success');
            }
          },

          error: () => {
            this.bulkAdd = false;
            this.bulkAddUploading = false;
            this.masterSvc
              .notification()
              .toast('Import Failed. Please try again.', 'danger');
          },
        });
      }
    });
  }

  downloadMasterList(items: InventoryItem[]) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      // Group the items by location
      const groupedItems = items.reduce((acc, item) => {
        // Use "Unknown Location" for items without a location
        const locationKey = item.location || 'Main Yard';

        if (!acc[locationKey]) {
          acc[locationKey] = [];
        }
        acc[locationKey].push(item);
        return acc;
      }, {} as { [key: string]: InventoryItem[] });

      const locations = Object.keys(groupedItems);

      // Process PDFs in chunks to prevent UI blocking
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        try {
          // Use requestAnimationFrame to avoid blocking the UI
          await new Promise((resolve) => requestAnimationFrame(resolve));

          const pdf = await this.masterSvc
            .pdf()
            .masterInventoryList(
              groupedItems[location],
              location,
              this.company
            );

          await this.masterSvc
            .pdf()
            .handlePdf(
              pdf,
              `${this.company.name.replace(
                /[.\s]+/g,
                ''
              )}-Inventory-Masterlist-${location}-${new Date().toDateString()}`
            );
        } catch (error) {
          console.error(
            `Error generating or handling PDF for location ${location}:`,
            error
          );
        }
      }
    });
  }

  downloadMasterListXsl(items: InventoryItem[]) {
    // Transform the data
    const data = items.map((item) => ({
      code: item?.code.toString(),
      category: item?.category,
      size: item?.size,
      name: item?.name,
      location: item?.location,
      totalQty: +item?.yardQty || 0,
      availableQty: +this.calcPipe.transform(item),
      inUseQty: +item?.inUseQty || 0,
      reservedQty: +item?.reservedQty || 0,
      inMaintenance: +item?.inMaintenanceQty || 0,
      damagedQty: +item?.damagedQty || 0,
      lostQty: +item?.lostQty || 0,
      weight: +item?.weight || 0,
      totalWeight: +item?.weight * +item?.yardQty || 0,
      hireCost: +item?.hireCost || 0,
      replacementCost: +item?.replacementCost || 0,
      sellingCost: +item?.sellingCost || 0,
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'list');

    // Get the range of the data (including headers)
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Create a table definition
    const tableName = 'InventoryTable';
    const tableId = 1; // Table ID needs to be unique within the workbook

    // Define the table reference (e.g., "A1:R100")
    const startCell = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c });
    const endCell = XLSX.utils.encode_cell({ r: range.e.r, c: range.e.c });
    const tableRef = `${startCell}:${endCell}`;

    // Define table style - medium is a common style
    const tableStyle = 'TableStyleMedium2';

    // Add the table definition to the sheet
    if (!ws['!tables']) {
      ws['!tables'] = [];
    }
    ws['!tables'].push({
      ref: tableRef,
      name: tableName,
      tableId,
      headerRow: true,
      totalsRow: false,
      style: tableStyle,
      columns: Object.keys(data[0]).map((key) => ({
        name: key,
        dataCellStyle: { font: { bold: false } },
        headerCellStyle: { font: { bold: true } },
        totalsRowFunction: 'none',
      })),
    });

    // Add Table definition in the workbook
    if (!wb.Workbook) {
      wb.Workbook = { Sheets: [], Names: [] };
    }
    if (!wb.Workbook.Sheets) {
      wb.Workbook.Sheets = [];
    }

    // Configure the sheet
    if (!wb.Workbook.Sheets[0]) {
      wb.Workbook.Sheets[0] = {};
    }
    wb.Workbook.Sheets[0].Hidden = 0;

    // Add auto-filter capability
    ws['!autofilter'] = { ref: tableRef };

    // Apply some styling to make it look better
    // Set column widths for better readability
    ws['!cols'] = Object.keys(data[0]).map(() => ({ wch: 15 })); // Default width for all columns

    // Apply header formatting
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'DDDDDD' } },
    };
    Object.keys(data[0]).forEach((key, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) {
        ws[cellRef] = { v: key };
      }
      ws[cellRef].s = headerStyle;
    });

    // Export the workbook to an Excel file
    XLSX.writeFile(wb, `${this.company.name}-Inventory-Masterlist.xlsx`);
  }

  downloadMasterListXslUpdate(items: InventoryItem[]) {
    const ws = XLSX.utils.json_to_sheet(
      items.map((item) => ({
        id: item?.id,
        code: item?.code,
        category: item?.category,
        size: item?.size,
        name: item?.name,
        location: item?.location,
        totalQty: item?.yardQty,
        availableQty: this.calcPipe.transform(item),
        editQty: 0,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'list');
    XLSX.writeFile(wb, `${this.company.name}-Update-Inventory-Masterlist.xlsx`);
  }

  async downloadMasterlistMatrix() {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const data = await lastValueFrom(
      this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${company.id}/siteStock`, [
          where('ids', '!=', []),
        ])
        .pipe(take(1))
    );

    // Create a matrix that includes site and item data
    const matrix = [];

    data.forEach((siteStock) => {
      siteStock.items.forEach((item) => {
        matrix.push({
          item,
          site: siteStock.site.name,
          availableQty: item.availableQty,
        });
      });
    });

    // Export the matrix to Excel with sites as columns
    this.exportSiteMatrixToExcel(matrix);
  }

  private exportSiteMatrixToExcel(
    matrix: {
      item: any;
      site: string;
      availableQty: number;
    }[]
  ) {
    // Create a unique list of sites
    const sites = [...new Set(matrix.map((row) => row.site))];

    // Group items by their ID to prevent duplicates
    const itemMap = new Map();

    matrix.forEach((row) => {
      const itemId = row.item.id;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          id: itemId,
          code: row.item.code,
          name: row.item.name,
          category: row.item.category || '',
          weight: parseFloat(row.item.weight) || 0,
          location: row.item.location || '',
          siteQuantities: {},
        });
      }

      // Store the quantity for this item at this site
      itemMap.get(itemId).siteQuantities[row.site] = row.availableQty || 0;
    });

    // Convert the map to an array of unique items
    const uniqueItems = Array.from(itemMap.values());

    // Sort items by name
    uniqueItems.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Prepare a header row
    const header = [
      'Item Code',
      'Item Name',
      'Category',
      'Weight',
      'Location',
      ...sites,
      'Total Weight',
    ];

    // Create the rows, one for each unique item
    const rows = uniqueItems.map((item) => {
      // Fill in the available quantity for each site
      const quantities = sites.map((site) => item.siteQuantities[site] || 0);

      // Calculate total weight for this item across all sites
      const totalItemWeight = quantities.reduce(
        (sum, qty) => sum + qty * item.weight,
        0
      );

      return [
        item.code,
        item.name,
        item.category,
        item.weight,
        item.location,
        ...quantities,
        totalItemWeight,
      ];
    });

    // Calculate site weight totals
    const siteTotals = sites.map((site, siteIndex) =>
      rows.reduce((total, row) => {
        const itemWeight = parseFloat(row[3]) || 0; // Weight is at index 3
        const siteQty = parseFloat(row[5 + siteIndex]) || 0; // Site quantities start at index 5
        return total + itemWeight * siteQty;
      }, 0)
    );

    // Add a totals row
    const totalsRow = [
      'TOTAL WEIGHT',
      '',
      '',
      '',
      '',
      ...siteTotals,
      siteTotals.reduce((sum, total) => sum + total, 0), // Grand total weight
    ];

    // Combine the header, data rows, and totals row
    const formattedData = [header, ...rows, totalsRow];

    // Create a worksheet from the formatted data
    const ws = XLSX.utils.aoa_to_sheet(formattedData);

    // Add styling to the totals row
    const lastRowIndex = formattedData.length;
    const range = {
      s: { r: lastRowIndex - 1, c: 0 },
      e: { r: lastRowIndex - 1, c: header.length - 1 },
    };

    // Apply bold formatting to the totals row
    for (let col = 0; col < header.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: lastRowIndex - 1, c: col });
      if (!ws[cellRef]) {
        ws[cellRef] = {};
      }
      ws[cellRef].s = { font: { bold: true } };
    }

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Site Matrix');

    // Export the workbook to an Excel file
    XLSX.writeFile(wb, `${this.company.name}-Inventory-Matrix.xlsx`);
  }

  getAvailableQty(itemId: string, siteId: string): number {
    const cell = this.matrix.find(
      (m) => m.itemId === itemId && m.siteId === siteId
    );
    return cell ? cell.availableQty : 0;
  }

  async addItem() {
    const modal = await this.masterSvc.modal().create({
      component: AddStockitemComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addStockItem',
    });
    return await modal.present();
  }

  async editItem(item) {
    const modal = await this.masterSvc.modal().create({
      component: AddStockitemComponent,
      componentProps: {
        isEdit: true,
        value: item,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'editStockItem',
    });
    return await modal.present();
  }

  async duplicateItem(item) {
    const modal = await this.masterSvc.modal().create({
      component: DuplicateStockItemComponent,
      componentProps: {
        value: item,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'duplicateStockItem',
    });
    return await modal.present();
  }

  async viewItem(item: InventoryItem) {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    const sites$ = this.masterSvc
      .edit()
      .getCollectionWhere(
        `company/${company.id}/siteStock`,
        'ids',
        'array-contains',
        item.id
      )
      .pipe(
        map((data) =>
          data.map((doc) => {
            const single = doc.items.find((i: any) => i.id === item.id);
            return { site: doc.site, item: single };
          })
        )
      );
    const modal = await this.masterSvc.modal().create({
      component: ViewStockLocationsComponent,
      componentProps: { locations$: sites$, item },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewLocation',
    });
    return await modal.present();
  }

  async viewLog(item: InventoryItem) {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    const log$ = this.masterSvc
      .edit()
      .getCollectionFiltered(
        `company/${company.id}/stockItems/${item.id}/log`,
        [orderBy('date', 'desc')]
      );

    const modal = await this.masterSvc.modal().create({
      component: ViewStockLogComponent,
      componentProps: { log$ },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewLog',
    });
    return await modal.present();
  }

  async addShipment() {
    const modal = await this.masterSvc.modal().create({
      component: AddShipmentComponent,
      componentProps: {
        inventoryItems$: this.inventoryItems$.pipe(
          take(1),
          map((items) => {
            items.forEach((item) => {
              delete item.log;
            });
            return items;
          })
        ),
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addShipment',
    });
    return await modal.present();
  }

  async viewShipment(shipment: Delivery) {
    const modal = await this.masterSvc.modal().create({
      component: AddShipmentComponent,
      componentProps: {
        isEdit: true,
        inventoryItems$: this.inventoryItems$.pipe(
          take(1),
          map((items) => {
            items.forEach((item) => {
              delete item.log;
            });
            return items;
          })
        ),
        value: shipment,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'editShipment',
    });
    return await modal.present();
  }

  async addReturn() {
    const modal = await this.masterSvc.modal().create({
      component: TransactionReturnComponent,
      componentProps: {
        inventoryItems$: this.inventoryItems$.pipe(
          take(1),
          map((items) => {
            items.forEach((item) => {
              delete item.log;
            });
            return items;
          })
        ),
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addReturn',
    });
    return await modal.present();
  }
  async viewReturn(returnData: TransactionReturn) {
    const modal = await this.masterSvc.modal().create({
      component: TransactionReturnComponent,
      componentProps: {
        allowSend: true,
        isEdit: true,
        value: returnData,
        inventoryItems$: this.inventoryItems$.pipe(
          take(1),
          map((items) => {
            items.forEach((item) => {
              delete item.log;
            });
            return items;
          })
        ),
      },
      showBackdrop: false,
      id: 'viewReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addAdjustment() {
    const modal = await this.masterSvc.modal().create({
      component: TransactionAdjustmentComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addAdjustment',
    });
    return await modal.present();
  }
  async viewRequest(requestData: Request) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { allowSend: true, isEdit: true, value: requestData },
      showBackdrop: false,
      id: 'viewRequest',
      cssClass: 'fullscreen',
    });
    await modal.present();
    const { role } = await modal.onDidDismiss();
    role === 'approved'
      ? this.masterSvc
          .store()
          .dispatch(new Navigate('/dashboard/inventory?page=2'))
      : null;
    return true;
  }
  async addTransfer() {
    const modal = await this.masterSvc.modal().create({
      component: AddTransferComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addTransfer',
    });
    return await modal.present();
  }

  async viewTransfer(transfer: Transfer) {
    const modal = await this.masterSvc.modal().create({
      component: AddTransferComponent,
      componentProps: {
        isEdit: true,
        value: transfer,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewTransfer',
    });
    return await modal.present();
  }

  segmentChanged(ev: any) {
    this.active !== ev.detail.value
      ? (this.active = ev.detail.value)
      : console.log('same');
    this.importing = false;
  }

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=8&vid=0');
  }

  onFileChanged(event) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const file: File = event.target.files[0];
      const user = this.masterSvc.store().selectSnapshot(UserState.user);

      if (file) {
        Papa.parse(file, {
          header: true,
          worker: true,
          dynamicTyping: true,

          complete: async (result) => {
            this.uploading = true;
            const data = result.data.map((item) => ({
              code: item.Code || '',
              category: item.Category || '',
              size: item.Size || '',
              name: item.Description || '',
              location: item.Location || '',
              yardQty: +item.Yard_Qty || 0,
              availableQty: +item.Yard_Qty || 0,
              weight: parseFloat(item.Weight) || 0,
              inMaintenanceQty: 0,
              inUseQty: 0,
              damagedQty: 0,
              lostQty: 0,
              hireCost: parseFloat(item.Hire_Cost) || 0,
              replacementCost: parseFloat(item.Replacement_Cost) || 0,
              sellingCost: parseFloat(item.Selling_Cost) || 0,
              log: [
                {
                  message: `${user.name} added ${item.Yard_Qty} items to the yard.`,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image || '',
                  },
                  date: new Date(),
                  status: 'add',
                  comment: 'Imported',
                },
              ],
            }));
            const company = this.masterSvc
              .store()
              .selectSnapshot(CompanyState.company).id;
            this.uploadCounter = 0;
            this.uploadTotal = data.length || 0;
            for (const item of data) {
              try {
                await this.masterSvc
                  .edit()
                  .addDocument(`company/${company}/stockItems`, item);
              } catch (error) {
                console.log(error);
              } finally {
                this.uploadCounter++;
              }
            }
            if (this.uploadCounter === this.uploadTotal) {
              this.importing = false;
              this.uploading = false;
              this.masterSvc
                .notification()
                .toast('Import Successful', 'success');
            }
          },

          error: () => {
            this.importing = false;
            this.uploading = false;
            this.masterSvc
              .notification()
              .toast('Import Failed. Please try again.', 'danger');
          },
        });
      }
    });
  }

  private init() {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    if (!this.company) {
      setTimeout(() => {
        console.log('retry');
        this.init();
      }, 200);
    } else {
      this.inventoryItems$ = this.masterSvc
        .edit()
        .getCollectionOrdered(
          `company/${this.company.id}/stockItems`,
          'code',
          'asc'
        );

      // shipments
      this.shipments$ = this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/shipments`, [
          where('status', 'in', ['sent', 'received']),
          orderBy('code', 'desc'),
        ]);
      this.pendingShipments$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/shipments`,
          'status',
          '==',
          'pending',
          'code',
          'asc'
        );
      this.outboundShipments$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/shipments`,
          'status',
          '==',
          'on-route',
          'code',
          'asc'
        );
      this.reservedShipments$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/shipments`,
          'status',
          '==',
          'reserved',
          'code',
          'asc'
        );
      this.voidShipments$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/shipments`,
          'status',
          '==',
          'void',
          'code',
          'asc'
        );

      // transfers
      this.transfers$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/poTransfers`,
          'status',
          '==',
          'sent',
          'code',
          'asc'
        );
      this.pendingTransfers$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/poTransfers`,
          'status',
          '==',
          'pending',
          'code',
          'asc'
        );
      // requests
      this.requests$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/requests`,
          'status',
          '==',
          'approved',
          'code',
          'asc'
        );
      this.submittedRequests$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/requests`,
          'status',
          '==',
          'submitted',
          'code',
          'asc'
        );
      this.partialRequests$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/requests`,
          'status',
          '==',
          'partial shipment',
          'code',
          'asc'
        );
      // returns
      this.returns$ = this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/returns`, [
          where('status', 'in', ['sent', 'received']),
          orderBy('code', 'desc'),
        ]);
      this.submittedReturns$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/returns`,
          'status',
          '==',
          'submitted',
          'code',
          'desc'
        );
      this.outboundReturns$ = this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${this.company.id}/returns`, [
          where('status', 'in', ['on-route', 'collected']),
          orderBy('code', 'desc'),
        ]);
      this.voidReturns$ = this.masterSvc
        .edit()
        .getCollectionWhereAndOrder(
          `company/${this.company.id}/returns`,
          'status',
          '==',
          'void',
          'code',
          'desc'
        );
    }
  }
}
