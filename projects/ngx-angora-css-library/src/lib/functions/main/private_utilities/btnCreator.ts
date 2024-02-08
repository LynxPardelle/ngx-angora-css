/* Singletons */
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { color_transform } from '../../color_transform';
import { console_log } from '../../console_log';
import { combinators } from '../../utilities/combinators';
import {
  TNameVal,
  TNameValNumber,
  TNameValProp,
} from '../private_types/types.private';
import { propertyNValueCorrector } from './propertyNValueCorrector';
const values: ValuesSingleton = ValuesSingleton.getInstance();
export const btnCreator = async (
  class2Create: string,
  specify: string,
  value: string,
  secondValue: string = '',
  outline: boolean = false
): Promise<string> => {
  const combinatorsValuesNumbers = combinators.combineArrays<
    TNameVal,
    number,
    TNameValNumber
  >(
    {
      name: 'val',
      array: [
        { name: 'value', val: value },
        { name: 'secondValue', val: secondValue },
      ],
    },
    { name: 'number', array: [-15, -20, -25, 3] }
  );
  console_log.consoleLog('info', {
    combinatorsValuesNumbers: combinatorsValuesNumbers,
  });
  const shadesArray: TNameVal[] = await Promise.all(
    combinatorsValuesNumbers.map(
      async (a: TNameValNumber): Promise<TNameVal> => {
        return {
          name: `${a.val.name},${a.number}`,
          val: await color_transform.getShadeTintColorOrGradient(
            a.number,
            a.val.val
          ),
        };
      }
    )
  );
  console_log.consoleLog('info', { shadesArray: shadesArray });
  const shades: { [key: string]: string } =
    combinators.combineIntoObject(shadesArray);
  console_log.consoleLog('info', { shades: shades });
  let shadowColorValue: string = color_transform.opacityCreator(
    shades['value,3'],
    0.5
  );
  const correctVals: { [key: string]: string } = combinators.combineIntoObject(
    await Promise.all(
      combinators
        .combineArrays<TNameVal, string, TNameValProp>(
          {
            name: 'val',
            array: [
              { name: 'value', val: value },
              { name: 'secondValue', val: secondValue },
            ].concat(shadesArray),
          },
          { name: 'prop', array: ['background-color', 'color', 'border-color'] }
        )
        .map(async (a: TNameValProp): Promise<TNameVal> => {
          return {
            name: `${a.val.name},${a.prop}`,
            val: await propertyNValueCorrector(a.prop, a.val.val),
          };
        })
    )
  );
  console_log.consoleLog('info', { correctVals: correctVals });
  let newRuleArray: string[] = [];
  /* Basic Button */
  newRuleArray.push(
    `${specify}{${
      outline && secondValue
        ? correctVals['value,color'] +
          correctVals['secondValue,background-color'] +
          correctVals['secondValue,border-color']
        : correctVals['value,background-color'] +
          correctVals['value,border-color']
    }}`
  );
  /* Hover Button */
  newRuleArray.push(
    `.${class2Create}${specify}:hover{${
      outline && secondValue
        ? correctVals['secondValue,color'] +
          correctVals['value,-15,background-color']
        : correctVals['value,-20,border-color'] +
          correctVals['value,background-color']
    }}`
  );
  /* FocusButton */
  if (!!outline) {
    newRuleArray.push(
      `.btn-check:focus + .${class2Create}${specify}, .${class2Create}${specify}:focus{${
        outline && secondValue
          ? correctVals['secondValue,-15,background-color'] +
            correctVals['secondValue,-15,border-color']
          : correctVals['value,-15,background-color'] +
            correctVals['value,-15,border-color']
      }}`
    );
  }
  /* Checked Button */
  newRuleArray.push(
    `.btn-check:checked + .${class2Create}${specify}, .btn-check:active + .${class2Create}${specify}, .${class2Create}${specify}:active, .${class2Create}${specify}.active, .show > .${class2Create}${specify} .dropdown-toggle{${
      outline && secondValue
        ? correctVals['value,-25,border-color']
        : correctVals['value,-20,background-color'] +
          correctVals['value,-25,border-color']
    }box-shadow: 0 0 0 0.25rem ${shadowColorValue};}`
  );
  newRuleArray.push(
    `.btn-check:checked + .btn-check:focus, .btn-check:active + .${class2Create}${specify}:focus, .${class2Create}${specify}:active:focus, .${class2Create}${specify}.active:focus, .show > .${class2Create}${specify} .dropdown-toggle:focus{box-shadow: 0 0 0 0.25rem ${shadowColorValue};}`
  );
  console_log.consoleLog('info', { newRuleArray: newRuleArray });
  return newRuleArray.filter((c) => c !== '').join(values.separator);
};
