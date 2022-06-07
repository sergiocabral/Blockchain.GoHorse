import { TemplateString } from '../../ts';
import {
  HelperText,
  InvalidDataError,
  InvalidExecutionError
} from '@sergiocabral/helper';

class TemplateStringTestNotCreated extends TemplateString {
  protected keyToValue(key: string): string {
    return '';
  }
}
const TemplateStringTestCreatedKey = '{templateKey}';
const TemplateStringTestCreatedValue = Math.random().toString();
class TemplateStringTestCreated extends TemplateString {
  public TEMPLATE_KEY = TemplateStringTestCreatedKey;
  public TEMPLATE_KEY2 = '{ops1}';
  public TEMPLATE_KEY3 = '{ops2}';
  protected keyToValue(key: string): string {
    return TemplateStringTestCreatedValue;
  }
}

class TemplateStringTestInvalidKey extends TemplateString {
  public TEMPLATE_KEY_INVALID = 'withou brackets';
  protected keyToValue(key: string): string {
    return '';
  }
}

describe('Class: TemplateString', () => {
  beforeEach(() => {
    (
      TemplateString as unknown as Record<string, unknown[]>
    ).instances.length = 0;
  });
  test('Se localizar instância nunca criada deve falhar', () => {
    // Arrange, Given
    // Act, When

    const getter = () =>
      TemplateString.getInstance(TemplateStringTestNotCreated);

    // Assert, Then

    expect(getter).toThrowError(InvalidExecutionError);
  });
  test('Deve ser capaz de localizar uma instância já criada', () => {
    // Arrange, Given

    const instanceCreated = new TemplateStringTestCreated();

    // Act, When

    const instanceReceived = TemplateString.getInstance(
      TemplateStringTestCreated
    );

    // Assert, Then

    expect(instanceReceived).toBe(instanceCreated);
  });
  test('Após cada instância criada seus chaves passam a ser usadas para substituição', () => {
    // Arrange, Given

    const templateString = `template1: ${TemplateStringTestCreatedKey}, template2: ${TemplateStringTestCreatedKey}`;
    const expectedReplaced = HelperText.replaceAll(
      templateString,
      TemplateStringTestCreatedKey,
      TemplateStringTestCreatedValue
    );

    // Act, When

    const firstReaded = TemplateString.replace(templateString);
    new TemplateStringTestCreated();
    const secondReaded = TemplateString.replace(templateString);

    // Assert, Then

    expect(firstReaded).toBe(templateString);
    expect(secondReaded).not.toBe(firstReaded);
    expect(secondReaded).toBe(expectedReplaced);
  });
  test('Instâncias devem usar nomes de chaves entre { e }', () => {
    // Arrange, Given

    new TemplateStringTestInvalidKey();

    // Act, When

    const getter = () => TemplateString.replace('any text');

    // Assert, Then

    expect(getter).toThrowError(InvalidDataError);
  });
});
