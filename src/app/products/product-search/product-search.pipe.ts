import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})

export class ProductSearchPipe implements PipeTransform {
  transform(value: any, searchString: string, propertyName1: string): any {
    if (value.length === 0) {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      if (item[propertyName1] === searchString) {
        resultArray.push(item);
      }
      console.log(searchString);
      console.log(resultArray);
    }
    return resultArray;
  }
}
