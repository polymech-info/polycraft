import type { IComponentNode, IComponentConfig } from '@polymech/commons'
import config from "@/app/config.json" with { type: "json" }

interface ShippingDetails {
    "@type": "OfferShippingDetails";
    shippingRate: MonetaryAmount;
    shippingDestination: DefinedRegion;
    deliveryTime: ShippingDeliveryTime;
}

interface MonetaryAmount {
    "@type": "MonetaryAmount";
    value: number;
    currency: string;
}

interface DefinedRegion {
    "@type": "DefinedRegion";
    addressCountry: string;
}

interface ShippingDeliveryTime {
    "@type": "ShippingDeliveryTime";
    handlingTime: QuantitativeValue;
    transitTime: QuantitativeValue;
}

interface QuantitativeValue {
    "@type": "QuantitativeValue";
    minValue: number;
    maxValue: number;
    unitCode: string;
}

interface ProductJsonLD {
    '@context': 'https://schema.org'
    '@type': 'Product'
    name: string
    description?: string
    sku?: string
    image?: string,
    itemCondition?: string
    brand?: {
        '@type': 'Brand'
        name: string
    }
    offers?: {
        '@type': 'Offer'
        price?: number
        priceCurrency?: string
        availability?: string
        url?: string
        shippingDetails?: ShippingDetails,
        itemCondition?: string
    }
}

export const get = async (node: IComponentNode, component: IComponentConfig, opts: {
    url?: string
}): Promise<ProductJsonLD> => {

    if(!component.price || !component.body){
        return {} as any
    }

    const jsonLD: ProductJsonLD = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: component.name,
        description: component.body || component.keywords,
        sku: component.code,
        brand: {
            '@type': 'Brand',
            name: config.ecommerce?.brand || config.site.title
        }
    }
    if (component.image?.url) {
        jsonLD.image = component.image.url
    }

    jsonLD.offers = {
        '@type': 'Offer',
        price: component.price,
        priceCurrency: config.ecommerce?.currencyCode || 'EUR',
        availability: 'https://schema.org/MadeToOrder',
        url: opts.url || config.site.base_url,
        itemCondition: "https://schema.org/NewCondition"

    }

    if (component.shipping) {
        const shipping = component.shipping || {
            price: 0,
            handling: 2,
            transit: 12
        }
        jsonLD.offers.shippingDetails = {
            "@type": "OfferShippingDetails",
            "shippingRate": {
                "@type": "MonetaryAmount",
                "value": shipping?.price,
                "currency": "EUR"
            },
            "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 0,
                    "maxValue": shipping?.handling,
                    "unitCode": "DAY"
                },
                "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": shipping.transit,
                    "unitCode": "DAY"
                }
            }
        } as any
    }
    return jsonLD
}
