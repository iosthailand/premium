import { Pipe, PipeTransform } from '@angular/core';
import { expressionType } from '@angular/compiler/src/output/output_ast';

@Pipe({
  name: 'filter',
  pure: false
})

export class ProductSearchPipe implements PipeTransform {
  transform(value: any, searchString: string, propertyName1: string, propertyName2: string): any {
    if (value.length === 0 && searchString === ' ') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      const myReg = new RegExp(searchString);
      if ((myReg.test(item[propertyName1]) === true || myReg.test(item[propertyName2]) === true) && searchString.length >= 3) {
        resultArray.push(item);
      }
    }
    return resultArray;
  }
}
