import {defaultSettings} from '../define.js';
import db from "../db.server.js";

class Shop {
  settings;
  shop;
  expires;
  plan;
  planStatus;
  email = '';

  constructor(params) {
    Object.assign(this, params);
  }

  getSettings() {
    if (!this.settings) return defaultSettings;
    return Object.assign({}, defaultSettings, JSON.parse(this.settings));
  }

  async updateShop() {
    let expires = this.expires ? new Date(this.expires) : null;

    await db.shop.upsert({
      where: {
        shop: this.shop
      },
      update: {
        settings: this.settings,
        plan: this.plan,
        email: this.email,
        planStatus: this.planStatus,
        expires: expires,
      },
      create: {
        shop: this.shop,
        settings: this.settings,
        plan: this.plan,
        email: this.email,
        planStatus: this.planStatus,
        expires: expires,
      }
    });
  }

}

export default Shop;

export const loadShop = async (shop) => {
  let shopData = await db.shop.findUnique({
    where: {
      shop: shop
    }
  });

  if (!shopData) {
    shopData = {shop: shop}
  }

  return new Shop(shopData);
};


