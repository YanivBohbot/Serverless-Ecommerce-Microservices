import { esClient, PRODUCTS_INDEX } from "../config/elasticsearch";
import { ProductDocument } from "../types/search.types";

export const indexProduct = async (product: ProductDocument): Promise<void> => {
  await esClient.index({
    index: PRODUCTS_INDEX,
    id: product.productId,
    document: product,
  });
  console.log(`🏪 Indexed product ${product.productId} (stock: ${product.stock})`);
};
