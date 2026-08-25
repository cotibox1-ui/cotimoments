import CatalogManager from './CatalogManager';
export default function ProductsPage() {
  return <CatalogManager endpoint="/products" title="Productos" hasCategory />;
}
