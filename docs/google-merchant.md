# **Extracting Data from Astro Collections for Google Merchant Center**

This guide provides a comprehensive overview of how to extract data from a custom Astro collection and format it for a Google Merchant Center feed. It includes examples and configuration details to help you get started.

## **Understanding Google Merchant Center Data Feeds**

A Google Merchant Center data feed is a file that contains information about the products you want to sell online. This information is used to create Shopping ads and free product listings on Google.

The data feed must be in a specific format, and it must contain certain attributes for each product 1. These attributes include:

| Attribute | Description | Required |
| :---- | :---- | :---- |
| id | A unique identifier for the product | Yes |
| title | The title of the product | Yes |
| description | A description of the product | Yes |
| link | The URL of the product page on your website | Yes |
| image\_link | The URL of an image of the product | Yes |
| additional\_image\_link | The URL of an additional image of the product 2 | No |
| availability | The availability of the product (in stock, out of stock, preorder) | Yes |
| price | The price of the product | Yes |
| brand | The brand of the product | Yes |
| gtin | The Global Trade Item Number (GTIN) of the product, such as a UPC or EAN | Yes (if applicable) |
| identifier\_exists | Specifies whether identifiers exist for products without GTINs 3 | Yes (if applicable) |
| shipping | Shipping information for the product 4 | Yes |
| tax | Tax information for the product 4 | Yes |

Depending on the category that your products fall into, some other attributes may also be required 5. For example, if you sell apparel, you will be required to provide size, gender, color, and age group.

You can create a data feed in several different formats, including:

* **Text (TXT)**  
* **Tab Separated Values (TSV)**  
* **Extensible Markup Language (XML)**

While TXT and TSV files are suitable for smaller catalogs, Google recommends using XML for larger catalogs or more complex data, as it offers better structure and scalability 6.

## **Extracting Data from an Astro Collection**

Astro is a static site generator that allows you to create websites using a variety of different technologies. One of the features of Astro is content collections, which allow you to store and query data in a structured way 7. This makes Astro an excellent choice for managing product data and generating Google Merchant Center feeds. Astro offers several advantages in this context:

* **Flexibility:** Astro supports various data formats, including Markdown, MDX, JSON, YAML, and TOML, allowing you to store product information in a way that suits your needs 8.  
* **Type Safety:** Astro's Content Collections API provides type safety, ensuring that the data you extract from your collection conforms to a predefined schema. This helps prevent errors and ensures data consistency 7.  
* **Ease of Data Fetching:** Astro provides built-in functions like getCollection and getEntry to easily fetch data from your collections, simplifying the process of creating a data feed 8.

To extract data from an Astro collection, you can use the getCollection function. This function takes the name of the collection as an argument and returns an array of entries 8. Each entry contains the data for a single item in the collection.

For example, if you have a collection called products, you can extract the data for all products using the following code:

JavaScript

`import { getCollection } from 'astro:content';`

`const products = await getCollection('products');`

This will return an array of product entries. Each entry will have the following properties:

* **id:** The ID of the product  
* **slug:** The slug of the product  
* **data:** The frontmatter data for the product  
* **body:** The body content of the product

You can then use this data to create a Google Merchant Center data feed.

## **Creating a Google Merchant Center Data Feed from an Astro Collection**

To create a Google Merchant Center data feed from an Astro collection, you need to:

1. Extract the data from the collection using the getCollection function.  
2. Format the data in the required format (TXT, TSV, or XML).  
3. Include all the required attributes for each product.

Astro's dynamic routing capabilities can be leveraged to generate product pages from the collection, making it easier to manage product URLs and ensure they are consistent with your data feed 9.

### **Creating a TXT Data Feed**

Here is an example of how to create a TXT data feed from an Astro collection:

JavaScript

`import { getCollection } from 'astro:content';`

`const products = await getCollection('products');`

`const feed = products.map((product) => {`  
  ``return `${product.data.id}\t${product.data.title}\t${product.data.description}\t${product.data.link}\t${product.data.image_link}\t${product.data.availability}\t${product.data.price}\t${product.data.brand}\t${product.data.gtin}`;``  
`}).join('\n');`

This code will create a TXT file with the following format:

`id    title    description    link    image_link    availability    price    brand    gtin`  
`123    Product 1    This is a product    https://example.com/product1    https://example.com/product1.jpg    in stock    10.00    Brand A    1234567890123`  
`456    Product 2    This is another product    https://example.com/product2    https://example.com/product2.jpg    out of stock    20.00    Brand B    4567890123456`

### **Creating a TSV Data Feed**

Creating a TSV data feed is very similar to creating a TXT feed. The only difference is that you use a tab character (\\t) to separate the values in each row.

JavaScript

`import { getCollection } from 'astro:content';`

`const products = await getCollection('products');`

`const feed = products.map((product) => {`  
  ``return `${product.data.id}\t${product.data.title}\t${product.data.description}\t${product.data.link}\t${product.data.image_link}\t${product.data.availability}\t${product.data.price}\t${product.data.brand}\t${product.data.gtin}`;``  
`}).join('\n');`

This code will create a TSV file with the same format as the TXT example above.

### **Creating an XML Data Feed**

Creating an XML data feed requires a slightly different approach. You need to create an XML document with a specific structure. Here's an example of an XML data feed in Markdown format 10:

XML

`<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">`  
  `<channel>`  
    `<title>Example - Google Store</title>`  
    `<link>https://store.google.com</link>`  
    `<description>This is an example of a basic RSS 2.0 document containing a single item</description>`  
    `<item>`  
      `<g:id>TV_123456</g:id>`  
      `<g:title>Chromecast with Google TV</g:title>`  
      `<g:description>Enjoy your favorite entertainment in up to 4K with HDR. Stream from your phone to TV with Chromecast built-in.</g:description>`  
      `<g:google_product_category>Electronics > Televisions > Streaming Media Players</g:google_product_category>`  
      `<g:product_type>Streaming Media Player</g:product_type>`  
      `<g:link>https://store.google.com/product/chromecast_google_tv</g:link>`  
      `<g:image_link>https://images.example.com/TV_123456.png</g:image_link>`  
      `<g:condition>new</g:condition>`  
      `<g:availability>in stock</g:availability>`  
      `<g:price>49.99 USD</g:price>`  
      `<g:brand>Google</g:brand>`  
      `<g:gtin>810028711558</g:gtin>`  
      `<g:mpn>GA01919-US</g:mpn>`  
      `<g:shipping>`  
        `<g:country>US</g:country>`  
        `<g:service>Standard</g:service>`  
        `<g:price>0 USD</g:price>`  
      `</g:shipping>`  
      `<g:tax>`  
        `<g:country>US</g:country>`  
        `<g:rate>8.25</g:rate>`  
        `<g:tax_ship>true</g:tax_ship>`  
      `</g:tax>`  
    `</item>`  
  `</channel>`  
`</rss>`

You can generate this XML structure dynamically using the product data extracted from your Astro collection.

## **Shipping Information**

To provide accurate shipping costs in Google Merchant Center, you need to include the shipping attribute in your data feed 4. This attribute allows you to specify shipping rates for different destinations and shipping services.

The shipping attribute has several sub-attributes, including:

* country: The country to which the shipping rate applies.  
* service: The name of the shipping service.  
* price: The shipping cost for the service.

You can specify multiple shipping rates for a single product by including multiple shipping elements in the data feed.

## **Tax Information**

Similarly, the tax attribute is crucial for accurate tax calculations in Google Merchant Center 4. This attribute allows you to specify tax rates for different destinations.

The tax attribute has several sub-attributes, including:

* country: The country to which the tax rate applies.  
* rate: The tax rate as a percentage.  
* tax\_ship: Whether tax is applied to shipping costs.

You can specify multiple tax rates for a single product by including multiple tax elements in the data feed.

## **3D Models**

Google Merchant Center allows you to include 3D models of your products in your data feed 4. This can enhance the shopping experience for customers by allowing them to view your products from all angles.

To include a 3D model, you need to provide a URL to a .gltf or .glb file in the additional\_image\_link attribute. The file size should not exceed 15MB, and textures in the file can be up to 2K resolution.

## **Promotional Feeds**

Google Merchant Center allows you to create separate promotional feeds to highlight special offers and promotions for your products 3. This can help attract more customers and increase sales.

A promotional feed contains information about your promotions, such as the promotion ID, product applicability, offer type, and validity dates. You can create a promotional feed in TXT, XML, or Google Sheets format.

## **Local Inventory Ads**

Local Inventory Ads allow you to showcase your products to nearby shoppers who are searching on Google 3. These ads show product information, such as availability and price, and direct shoppers to your local store.

To use Local Inventory Ads, you need to create a separate local product inventory feed that contains information about the products you sell in your physical store.

## **Product Ratings Feed**

Product Ratings Feed allows you to display product ratings from customers in your Shopping ads 3. This can help increase customer trust and encourage them to purchase your products.

To use Product Ratings Feed, you need to submit a feed that contains product ratings and reviews from a trusted source.

## **Google Manufacturer Center Feed**

Google Manufacturer Center Feed allows manufacturers to provide detailed and accurate information about their products 3. This information is used to improve the shopping experience for customers and help them make informed purchase decisions.

Manufacturers can submit information such as product titles, descriptions, images, and GTINs through the Manufacturer Center.

## **Configuring Your Astro Collection**

To configure your Astro collection for Google Merchant Center, you need to define a schema for the collection. The schema defines the data type for each attribute in the collection.

You can define a schema using the z object from the astro:content module. For example, the following code defines a schema for a product collection:

JavaScript

`import { defineCollection, z } from 'astro:content';`

`const products = defineCollection({`  
  `schema: z.object({`  
    `id: z.string(),`  
    `title: z.string(),`  
    `description: z.string(),`  
    `link: z.string().url(),`  
    `image_link: z.string().url(),`  
    `availability: z.enum(['in stock', 'out of stock', 'preorder']),`  
    `price: z.number(),`  
    `brand: z.string(),`  
    `gtin: z.string(),`  
  `}),`  
`});`

`export const collections = {`  
  `products,`  
`};`

This schema defines the following data types for each attribute:

* **id:** string  
* **title:** string  
* **description:** string  
* **link:** URL  
* **image\_link:** URL  
* **availability:** enum (in stock, out of stock, preorder)  
* **price:** number  
* **brand:** string  
* **gtin:** string

Schema validation is a crucial aspect of ensuring data accuracy and preventing errors in your Google Merchant Center feed 8. By defining a schema, you can ensure that the data in your collection is in the correct format and meets Google's requirements. This can prevent issues such as invalid data types, missing attributes, or incorrect values, which can lead to your products being disapproved or your feed being rejected.

## **Complete Example**

Here is a complete example of how to extract data from an Astro collection and format it for a Google Merchant Center data feed:

**src/content/config.ts**

JavaScript

`import { defineCollection, z } from 'astro:content';`

`const products = defineCollection({`  
  `schema: z.object({`  
    `id: z.string(),`  
    `title: z.string(),`  
    `description: z.string(),`  
    `link: z.string().url(),`  
    `image_link: z.string().url(),`  
    `availability: z.enum(['in stock', 'out of stock', 'preorder']),`  
    `price: z.number(),`  
    `brand: z.string(),`  
    `gtin: z.string(),`  
  `}),`  
`});`

`export const collections = {`  
  `products,`  
`};`

**src/pages/feed.astro**

JavaScript

`import { getCollection } from 'astro:content';`

`const products = await getCollection('products');`

`const feed = products.map((product) => {`  
  ``return `${product.data.id}\t${product.data.title}\t${product.data.description}\t${product.data.link}\t${product.data.image_link}\t${product.data.availability}\t${product.data.price}\t${product.data.brand}\t${product.data.gtin}`;``  
`}).join('\n');`

`Response.setHeader('Content-Type', 'text/tab-separated-values');`  
`Response.send(feed);`

This code will create a TXT data feed that you can upload to Google Merchant Center. You can adapt this code to generate TSV or XML data feeds as needed.

## **Uploading Your Feed to Google Merchant Center**

There are several ways to upload your product data feed to Google Merchant Center 11:

* **Using a URL (HTTP/HTTPS):** This method is suitable for merchants who have created their feed on platforms like Google Sheets or are using a third-party feed management tool. You provide Google with the URL of your feed, and Google will regularly fetch and update the data.  
* **Using a file (Local drive):** This method involves uploading a file from your local drive. It's best for merchants with very few products or those who rarely need to make adjustments to their feed.  
* **Via FTP:** This method allows you to upload your feed via FTP. It's suitable for larger feeds or merchants who prefer to manage their feeds using FTP.

## **Conclusion**

Extracting data from an Astro collection and formatting it for a Google Merchant Center data feed is a straightforward process. By following the steps in this guide, you can easily create a data feed that meets Google's requirements.

Astro's flexibility, type safety, and ease of data fetching make it an excellent choice for managing product data and generating Google Merchant Center feeds. By leveraging Astro's features, you can ensure data accuracy, streamline feed creation, and keep your product information up-to-date.

Accurate data and schema validation are essential for a successful Google Merchant Center experience. By adhering to Google's guidelines and best practices, you can ensure that your products are approved and your ads perform effectively.

For further information on Astro and Google Merchant Center, you can refer to the following resources:

* **Astro Documentation:** [https://docs.astro.build/](https://docs.astro.build/)  
* **Google Merchant Center Help Center:** [https://support.google.com/merchants/](https://support.google.com/merchants/)

#### **Works cited**

1\. Local product data specification \- Google Merchant Center Help, accessed on February 25, 2025, [https://support.google.com/merchants/answer/14779112?hl=en](https://support.google.com/merchants/answer/14779112?hl=en)  
2\. How to Add Products to Google Merchant Center (2025) \- Store Growers, accessed on February 25, 2025, [https://www.storegrowers.com/add-products-to-google-merchant-center/](https://www.storegrowers.com/add-products-to-google-merchant-center/)  
3\. Understanding Google Shopping Feed Requirements \- AdNabu Blog, accessed on February 25, 2025, [https://blog.adnabu.com/google-shopping-feed/google-shopping-feed-requirements/](https://blog.adnabu.com/google-shopping-feed/google-shopping-feed-requirements/)  
4\. Product data specification \- Google Merchant Center Help, accessed on February 25, 2025, [https://support.google.com/merchants/answer/7052112?hl=en](https://support.google.com/merchants/answer/7052112?hl=en)  
5\. How To Create Data Feeds In Google Merchant Center \- Go Fish Digital, accessed on February 25, 2025, [https://gofishdigital.com/blog/how-to-create-data-feeds-in-google-merchant-center/](https://gofishdigital.com/blog/how-to-create-data-feeds-in-google-merchant-center/)  
6\. How to create a product feed for Google Merchant Center \- Adwservice, accessed on February 25, 2025, [https://adwservice.com.ua/en/how-to-upload-a-feed-to-the-merchant-center](https://adwservice.com.ua/en/how-to-upload-a-feed-to-the-merchant-center)  
7\. How to use content collection in Astro. \- DEV Community, accessed on February 25, 2025, [https://dev.to/obinnaspeaks/how-to-use-content-collection-in-astro-43j2](https://dev.to/obinnaspeaks/how-to-use-content-collection-in-astro-43j2)  
8\. Content collections \- Astro Docs, accessed on February 25, 2025, [https://docs.astro.build/en/guides/content-collections/](https://docs.astro.build/en/guides/content-collections/)  
9\. Optional: Make a content collection \- Astro Docs, accessed on February 25, 2025, [https://docs.astro.build/en/tutorial/6-islands/4/](https://docs.astro.build/en/tutorial/6-islands/4/)  
10\. Create a product file for Merchant Center \- Google Help, accessed on February 25, 2025, [https://support.google.com/merchants/answer/12631822?hl=en](https://support.google.com/merchants/answer/12631822?hl=en)  
11\. 3 Methods of Uploading a Product Feed to Google Merchant Center \- DataFeedWatch, accessed on February 25, 2025, [https://www.datafeedwatch.com/blog/upload-product-feed-merchant-center](https://www.datafeedwatch.com/blog/upload-product-feed-merchant-center)