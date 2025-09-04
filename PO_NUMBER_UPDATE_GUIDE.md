# Purchase Order Number Update Feature

## Overview

This feature allows users to update PO (Purchase Order) numbers across all related records in the system. When a PO number is changed, it automatically updates all associated documents including transaction logs, shipments, adjustments, returns, invoices, and transfers.

## Components

### 1. POUpdateService (`src/app/services/po-update.service.ts`)

Central service that handles PO number updates across all collections.

**Key Methods:**

- `updateJobReferenceAcrossCollections()` - Updates PO number in all related collections
- `getUpdateCount()` - Returns count of records that will be affected by the change

### 2. Purchase Order Component Updates

Enhanced the existing purchase order component with:

- Update PO Number button in the header
- Impact analysis showing how many records will be affected
- Validation to prevent duplicate PO numbers

**Location:** `src/app/home/view-site/purchase-order/purchase-order.component.ts`

### 3. PO Number Manager Component (Optional)

Standalone component for bulk PO number management.

**Location:** `src/app/components/po-number-manager/`

## How to Use

### From Purchase Order View

1. Open any Purchase Order from the site view
2. Click the "Edit PO Number" chip in the header
3. System will show an impact analysis of records to be updated
4. Enter the new PO number
5. Confirm the update

### Impact Analysis

Before updating, the system shows:

- Number of transaction logs to be updated
- Number of shipments to be updated
- Number of adjustments to be updated
- Number of returns to be updated
- Number of invoices to be updated
- Number of transfers to be updated
- Total count of all records

## What Gets Updated

When a PO number is changed, the system updates:

1. **Purchase Order Document** - The main PO record
2. **Transaction Logs** - All delivery, return, and adjustment logs
3. **Shipments/Deliveries** - All delivery records
4. **Adjustments** - All inventory adjustment records
5. **Returns** - All return transaction records
6. **Transaction Invoices** - All invoices generated from this PO
7. **Transfers** - Both source and destination transfer records
8. **Site's PO List** - Removes old PO number and adds new one

## Validation

The system performs several validations:

- Checks if the new PO number already exists for the same site
- Prevents empty or invalid PO numbers
- Shows confirmation with impact analysis before proceeding

## Error Handling

- If validation fails, user sees appropriate error message
- If update fails partially, system attempts to rollback changes
- All operations are logged for debugging purposes

## Cloud Functions Impact

**Important:** This feature affects cloud functions in the separate repository. When updating PO numbers:

1. **Firestore Triggers** - Any cloud functions listening to PO number changes will be triggered
2. **Scheduled Functions** - Functions that filter by PO number will need to account for changed numbers
3. **Reporting Functions** - Historical reports may need to handle PO number changes
4. **Integration Functions** - External system integrations using PO numbers as keys will be affected

## Best Practices

1. **Backup Before Major Changes** - Consider backing up data before bulk PO number updates
2. **Off-Peak Updates** - Perform updates during low usage periods to minimize impact
3. **Test in Development** - Always test PO number changes in development environment first
4. **Communication** - Notify users when PO numbers are being updated
5. **Audit Trail** - Keep records of PO number changes for auditing purposes

## Future Enhancements

Potential improvements to consider:

1. Bulk PO number update functionality
2. PO number change history tracking
3. Rollback capability for recent changes
4. Integration with external systems notification
5. Advanced validation rules for PO number formats

## Troubleshooting

Common issues and solutions:

**Error: "PO number already exists for this site"**

- Solution: Choose a different PO number that's unique for the site

**Error: "Failed to update PO number"**

- Solution: Check network connection and try again
- Check browser console for detailed error messages

**Some records not updated**

- Solution: The system uses batch operations, if some fail, check permissions and data integrity

## Technical Notes

- Uses Firestore batch operations for atomicity
- Maximum 500 operations per batch (Firestore limitation)
- For large datasets, may need to implement chunked updates
- All updates are performed in a single transaction where possible
