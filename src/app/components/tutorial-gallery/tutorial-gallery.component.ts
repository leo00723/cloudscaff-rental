import { Component, HostListener, OnInit } from '@angular/core';
import { Chapter, Video } from 'src/app/models/tutorial.model';

@Component({
  selector: 'app-tutorial-gallery',
  templateUrl: './tutorial-gallery.component.html',
  styleUrls: ['./tutorial-gallery.component.scss'],
})
export class TutorialGalleryComponent implements OnInit {
  itemIndex = 0;
  chapterIndex = 0;
  time = '';
  chapters: Chapter[] = [
    {
      chapter: 'Intro',
      time: '00:16',

      videos: [
        {
          id: 'L3o3a27xb0M',
          title: 'Overview',
          time: '00:16',
        },
      ],
    },

    {
      chapter: 'Enquiry / Lead Management',
      time: '01:40',

      videos: [
        { id: 'O3uIMQl9bCk', title: 'Overview', time: '00:15' },
        {
          id: 'BzChKCDf0kI',
          title: 'Managing Enquiries / Leads',
          time: '01:25',
        },
      ],
    },
    {
      chapter: 'Estimating / Quoting',
      time: '00:09',

      videos: [
        {
          id: 'J27y1qzypJI',
          title: 'Estimating / Quoting Overview',
          time: '00:09',
        },
      ],
    },
    {
      chapter: 'Estimate / Quote - Standard',
      time: '12:11',

      videos: [
        { id: '17J1xMD2oe4', title: 'Overview', time: '00:06' },
        { id: 'Qzx0HDxFlHE', title: 'Create an Estimate', time: '00:57' },
        { id: 'FDqaZ0Fk7PY', title: 'Add a Scaffold ', time: '04:21' },
        { id: 'nPsFwsjFabI', title: 'Add Labor Costs', time: '00:50' },
        { id: 'fX7_MXaNtJg', title: 'Add Transport Costs', time: '00:41' },
        { id: '-9-_ilyVW0w', title: 'Add Additional Costs', time: '00:45' },
        { id: 'bbGtJBGrNRU', title: 'Private Budget', time: '00:50' },
        { id: 'HpAqDXPSEKI', title: 'Summary', time: '02:37' },
        { id: 'VyddMDpcDyw', title: 'Accept an Estimate', time: '01:09' },
      ],
    },
    {
      chapter: 'Estimate / Quote - Bulk',
      time: '04:29',

      videos: [
        { id: 'i_xwKtCkaLw', title: 'Overview', time: '00:31' },
        {
          id: 'mrpfUi3eIlo',
          title: 'Add Multiple Scaffolds',
          time: '01:23',
        },
        {
          id: 'SST3ZMwVf5s',
          title: 'Overall Private Budget',
          time: '00:10',
        },
        {
          id: 'MSzhYltBhXU',
          title: 'Summary',
          time: '01:36',
        },
        {
          id: 'bb9v-0Erud8',
          title: 'Accept a Bulk Estimate',
          time: '00:52',
        },
      ],
    },
    {
      chapter: 'Estimate / Quote - Inventory',
      time: '5:30',

      videos: [
        { id: 'X7g6qNbOep8', title: 'Overview', time: '00:25' },
        {
          id: 'P5vfgpTnJ6o',
          title: 'Shipments',
          time: '01:55',
        },
        {
          id: 'WbMLJI0Q-PM',
          title: 'Overall Budget',
          time: '00:20',
        },
        {
          id: 'IiIuUdKWoDY',
          title: 'Summary',
          time: '01:03',
        },
        {
          id: 'I8bw_TFilXE',
          title: 'Accept an Inventory Estimate',
          time: '00:33',
        },
        {
          id: 'p8AKlvJ92Sw',
          title: 'Billable Shipments',
          time: '00:14',
        },
        {
          id: 'xHQTKoJGueI',
          title: 'Send Shipments',
          time: '01:03',
        },
      ],
    },
    {
      chapter: 'Scaffold Management',
      time: '10:12',

      videos: [
        { id: 'ohAYQZP-Bak', title: 'Overview', time: '02:34' },
        { id: 'BmeyqXwCWeA', title: 'Inspections', time: '02:37' },
        { id: 'tmsfG7yIFao', title: 'Handover Certificates', time: '02:42' },
        { id: 'Q5GzWbaOa3k', title: 'Invoices', time: '01:39' },
        { id: 'QlN0OaAjPd0', title: 'Payment', time: '00:11' },
        { id: 'hvOl2CstHDk', title: 'Credit Notes', time: '00:33' },
      ],
    },
    {
      chapter: 'Site Management',
      time: '05:10',

      videos: [
        { id: '38qUNi2xanI', title: 'Overview', time: '00:07' },
        { id: 'gtoIvjDa4jY', title: 'Scaffold Register', time: '00:30' },
        { id: 'xZhNLGlAj2E', title: 'Manage Site Inventory', time: '00:17' },
        { id: 'DnkgBW4vMB8', title: 'Request Inventory', time: '00:56' },
        { id: 'RmfmJQpJYyE', title: 'Return Inventory', time: '00:35' },
        { id: '8H_jTk3ba-0', title: 'Billable Shipments', time: '00:07' },
        { id: 'BU5p7qYJcG4', title: 'Shipment Invoices', time: '00:34' },
        { id: 'WWT3SEti8xs', title: 'Operation Application', time: '00:51' },
        { id: 'RWE1mpYDn34', title: 'Payment Application', time: '00:51' },
        { id: 'k098HnIi-As', title: 'Edit Site Information', time: '00:27' },
      ],
    },
    {
      chapter: 'Inventory / Stock Management',
      time: '08:39',

      videos: [
        { id: 'py4z885vxWs', title: 'Overview', time: '00:43' },
        { id: 'mQehsusUEb8', title: 'View Component Locations', time: '00:21' },
        {
          id: 'n3RzePK2QHc',
          title: 'Edit Component Information',
          time: '00:26',
        },
        { id: 'Jryl8pJHCYs', title: 'Add Cross Hire & Search', time: '01:30' },
        { id: 'K56Qy6nlPoc', title: 'Delete a Component', time: '00:17' },
        { id: 'G8O0JXYw3Jw', title: 'Add a Component', time: '00:44' },
        { id: '7YONSDY4KrQ', title: 'Shipments', time: '00:08' },
        { id: 'HpDK0lfHcbQ', title: 'Create a Shipment', time: '01:15' },
        {
          id: '4K3sEO2SdjM',
          title: 'Manage Inventory Requests',
          time: '00:57',
        },
        { id: '8P1LJEnULsk', title: 'Manage Inventory Returns', time: '01:00' },
        { id: 'MGRsmql6-uQ', title: 'Transfers', time: '00:49' },
        { id: 'GVEhgEZQdSM', title: 'Track Component Location', time: '00:27' },
      ],
    },
    {
      chapter: 'Statements',
      time: '00:45',

      videos: [{ id: 't_DYWBVPMQE', title: 'Overview', time: '00:46' }],
    },
    {
      chapter: 'Business Settings',
      time: '00:45',

      videos: [{ id: 'A1cWl2aEERY', title: 'Overview', time: '00:45' }],
    },
    {
      chapter: 'Contact Us',
      time: '00:17',

      videos: [{ id: 'nrX5gdcNGzE', title: 'Overview', time: '00:17' }],
    },
    {
      chapter: 'Software Updates',
      time: '00:23',

      videos: [{ id: 'qbKqjv6WbhE', title: 'Overview', time: '00:23' }],
    },
  ];
  isLoading = false;

  selectedItem: Video = this.chapters[0].videos[0];
  selectedChapter: Chapter = this.chapters[0];

  constructor() {}

  ngOnInit(): void {}

  viewVideo(video: Video, itemIndex: number, chapterIndex: number) {
    this.selectedItem = video;
    this.itemIndex = itemIndex;
    this.chapterIndex = chapterIndex;
  }

  @HostListener('scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    document
      .getElementById('top')
      .classList[event.target.scrollTop > 20 ? 'add' : 'remove']('shadow-top');
    document
      .getElementById('bottom')
      .classList[
        event.target.scrollHeight -
          event.target.clientHeight -
          event.target.scrollTop >
        20
          ? 'add'
          : 'remove'
      ]('shadow-bottom');
  }
}
