import { Item } from './item.model';

export class ScaffoldCost {
  ld = { length: 0, width: 0, height: 0, type: 'length-decrease' };
  wd = { length: 0, width: 0, height: 0, type: 'width-decrease' };
  hd = { length: 0, width: 0, height: 0, type: 'height-decrease' };
  le = { length: 0, width: 0, height: 0, type: 'length-increase' };
  we = { length: 0, width: 0, height: 0, type: 'width-increase' };
  he = { length: 0, width: 0, height: 0, type: 'height-increase' };

  scaffoldCost(scaffold: Item, newScaffold: Item) {
    const cs = {
      length: +scaffold.length,
      width: +scaffold.width,
      height: +scaffold.height,
    };
    const ns = {
      length: +newScaffold.length,
      width: +newScaffold.width,
      height: +newScaffold.height,
    };
    const dismantle: {
      length: number;
      width: number;
      height: number;
      type: string;
    }[] = [];
    const erection: {
      length: number;
      width: number;
      height: number;
      type: string;
    }[] = [];

    if (
      ns.length >= cs.length &&
      ns.height >= cs.height &&
      ns.width >= cs.width
    ) {
      this.le = {
        length: ns.length - cs.length,
        width: cs.width,
        height: cs.height,
        type: 'length-increase',
      };
      this.we = {
        length: ns.length,
        width: ns.width - cs.width,
        height: cs.height,
        type: 'width-increase',
      };
      this.he = {
        length: ns.length,
        width: ns.width,
        height: ns.height - cs.height,
        type: 'height-increase',
      };
      if (this.le.length > 0 && this.le.width > 0 && this.le.height > 0)
        erection.push(this.le);
      if (this.we.length > 0 && this.we.width > 0 && this.we.height > 0)
        erection.push(this.we);
      if (this.he.length > 0 && this.he.width > 0 && this.he.height > 0)
        erection.push(this.he);
    } else if (
      ns.length <= cs.length &&
      ns.height <= cs.height &&
      ns.width <= cs.width
    ) {
      this.ld = {
        length: cs.length - ns.length,
        width: cs.width,
        height: cs.height,
        type: 'length-decrease',
      };
      this.wd = {
        length: ns.length,
        width: cs.width - ns.width,
        height: cs.height,
        type: 'width-decrease',
      };
      this.hd = {
        length: ns.length,
        width: ns.width,
        height: cs.height - ns.height,
        type: 'height-decrease',
      };
      if (this.ld.length > 0 && this.ld.width > 0 && this.ld.height > 0)
        dismantle.push(this.ld);
      if (this.wd.length > 0 && this.wd.width > 0 && this.wd.height > 0)
        dismantle.push(this.wd);
      if (this.hd.length > 0 && this.hd.width > 0 && this.hd.height > 0)
        dismantle.push(this.hd);
    } else {
      if (cs.height > ns.height) {
        this.hd.height = cs.height - ns.height;
        this.le.height = this.we.height = ns.height;
        this.ld.height = this.wd.height = cs.height;
        this.checkLength(ns, cs);
      } else if (cs.height < ns.height) {
        this.he.height = ns.height - cs.height;
        this.ld.height =
          this.wd.height =
          this.le.height =
          this.we.height =
            cs.height;
        this.checkLength(ns, cs);
      } else {
        this.we.height =
          this.wd.height =
          this.le.height =
          this.ld.height =
            cs.height;
        this.checkLength(ns, cs);
      }

      if (this.ld.length > 0) {
        dismantle.push(this.ld);
      }
      if (this.wd.width > 0) {
        dismantle.push(this.wd);
      }
      if (this.hd.height > 0) {
        dismantle.push(this.hd);
      }

      if (this.le.length > 0) {
        erection.push(this.le);
      }
      if (this.we.width > 0) {
        erection.push(this.we);
      }
      if (this.he.height > 0) {
        erection.push(this.he);
      }
    }
    return { dismantle, erection };
  }

  checkLength(ns: any, cs: any) {
    if (cs.length > ns.length) {
      this.ld.length = cs.length - ns.length;
      this.wd.length =
        this.we.length =
        this.he.length =
        this.hd.length =
          ns.length;
      this.checkWidth(ns, cs);
    } else if (cs.length < ns.length) {
      this.le.length = ns.length - cs.length;
      this.he.length = ns.length;
      this.wd.length = this.we.length = this.hd.length = cs.length;
      this.checkWidth(ns, cs);
    } else {
      this.we.length =
        this.wd.length =
        this.he.length =
        this.hd.length =
          cs.length;
      this.checkWidth(ns, cs);
    }
  }
  checkWidth(ns: any, cs: any) {
    if (cs.width > ns.width) {
      this.wd.width = cs.width - ns.width;
      this.le.width = this.he.width = this.hd.width = ns.width;
      this.ld.width = cs.width;
    } else if (cs.width < ns.width) {
      this.we.width = ns.width - cs.width;
      this.le.width = this.he.width = ns.width;
      this.ld.width = this.hd.width = cs.width;
    } else {
      this.ld.width = this.le.width = this.he.width = this.hd.width = cs.width;
    }
  }
}
