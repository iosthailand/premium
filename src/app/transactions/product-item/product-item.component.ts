import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../products/product.model';
import { ProductsService } from '../../products/products.service';
import { ProductItem } from '../../products/product-item.model';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit {
  productItemLists: ProductItem[];
  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.productItemLists = this.productsService.getProductsTransaction();
    // console.log(this.productItemLists);
  }
  onDeleteProduct(productId: string) {
    // console.log(productId);
    this.productsService.delelteTransaction(productId);
    this.productItemLists = this.productsService.getProductsTransaction();
  }
  onEditProduct(productId: string, qty: number, product: Product) {
    const quantity = Math.round(qty);
    const productQtyUpdate = quantity > 0 ? qty : 1;
    this.productsService.editTransaction(productId, productQtyUpdate, product);
  }
}
