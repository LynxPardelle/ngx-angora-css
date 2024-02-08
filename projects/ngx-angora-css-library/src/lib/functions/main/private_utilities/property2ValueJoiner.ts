/* Singletons */
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { console_log } from '../../console_log';
import { css_camel } from '../../css-camel';
import { btnCreator } from './btnCreator';
import { propertyNValueCorrector } from './propertyNValueCorrector';
const values: ValuesSingleton = ValuesSingleton.getInstance();
export const property2ValueJoiner = async (
  property: string,
  class2CreateSplited: string[],
  class2Create: string,
  propertyValues: string[] = [''],
  specify: string = ''
): Promise<string> => {
  let cssNamesParsedForBackgroundColor = Object.keys(
    values.cssNamesParsed
  ).filter((c) => values.cssNamesParsed[c].includes('background-color'));
  switch (true) {
    case !!values.cssNamesParsed[property.toString()]:
      if (typeof values.cssNamesParsed[property.toString()] === 'string') {
        return `${specify}${
          /* ['text', 'c'].includes(property) &&
          propertyValues[0].includes('gradient')
            ? '::before'
            :  */ ''
        }{${await propertyNValueCorrector(
          values.cssNamesParsed[property.toString()] as string,
          propertyValues[0]
        )}}`;
      } else {
        let properties: string[] = values.cssNamesParsed[
          property.toString()
        ] as Array<string>;
        return `${specify}{${(
          await Promise.all(
            properties.map(async (c: any, i: number) => {
              return await propertyNValueCorrector(
                c,
                propertyValues[i] || propertyValues[0] || ''
              );
            })
          )
        ).join('')}}`;
      }
      break;
    case class2CreateSplited[1].startsWith('link'):
      return ` a${specify}{${await propertyNValueCorrector(
        'color',
        propertyValues[0]
      )}}`;
      break;
    case class2CreateSplited[1].startsWith('btnOutline'):
      return await btnCreator(
        class2Create,
        specify,
        propertyValues[0],
        propertyValues[1] || '',
        true
      );
      break;
    case class2CreateSplited[1].startsWith('btn'):
      return await btnCreator(class2Create, specify, propertyValues[0]);
      break;
    default:
      return `${specify}{${await propertyNValueCorrector(
        css_camel.camelToCSSValid(property),
        propertyValues[0]
      )};}`;
      break;
  }
};
