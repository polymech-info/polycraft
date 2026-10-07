import type { IComponentNode, IComponentConfig } from '@polymech/commons'
// https://support.google.com/merchants/answer/6386198?hl=en#zippy=%2Cexample
// https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
// https://search.google.com/test/rich-results/result/r%2Fmerchant-listings?id=zK-WH_1fFMHIUY3yHqHj6Q
// import tag from "@types/google-publisher-tag"
import config from "@/app/config.json" with { type: "json" }
interface GoogleMerchantProduct {
    id: string
    title: string
    description?: string
    link: string
    image_link?: string
    price?: string // price + ISO currency
    availability?: string
    brand?: string
    condition?: string
    gtin?: string // Global Trade Item Number
}

export const get = async (node: IComponentNode, config: IComponentConfig, opts: {
    url?:string
}): Promise<GoogleMerchantProduct> => {
    const product: GoogleMerchantProduct = {
        id: config.code,
        title: config.name,
        description: config.keywords,
        link: node.path,
        image_link: config.image?.url,
        price: config.price?.toString() + ' EUR',
        availability: 'in_stock',
        brand: 'Polymech',
        condition: 'new'
    }
    return product
}
