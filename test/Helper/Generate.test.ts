import { Generate } from '../../ts';
import { InvalidArgumentError } from '@sergiocabral/helper';

describe('Class: Generate', () => {
  describe('id', () => {
    test('gerar valor aleatório', () => {
      // Arrange, Given
      // Act, When

      const id1 = Generate.id();
      const id2 = Generate.id();

      // Assert, Then

      expect(id1).not.toBe(id2);
    });
    test('deve pode definir prefixo', () => {
      // Arrange, Given

      const prefix = Math.random().toString();

      // Act, When

      const id = Generate.id(prefix);

      // Assert, Then

      expect(id.startsWith(prefix)).toBe(true);
      expect(id.length).toBeGreaterThan(prefix.length);
    });
    test('deve pode definir o comprimento do valor aleatório', () => {
      // Arrange, Given

      const length = Math.floor(Math.random() * 10 + 1);

      // Act, When

      const id = Generate.id('', length);

      // Assert, Then

      expect(id.length).toBe(length);
    });
    test('deve pode definir o prefixo e comprimento do valor aleatório', () => {
      // Arrange, Given

      const prefix = Math.random().toString();
      const length = Math.floor(Math.random() * 1000 + 1);

      // Act, When

      const id = Generate.id(prefix, length);

      // Assert, Then

      expect(id.length).toBe(prefix.length + length);
    });
    test('não aceita comprimento menor ou igual a zero', () => {
      // Arrange, Given
      // Act, When

      const tryWithZero = () => Generate.id('', 0);
      const tryWithLessThanZero = () =>
        Generate.id('', -(Math.random() * 1000 + 1));

      // Assert, Then

      expect(tryWithZero).toThrow(InvalidArgumentError);
      expect(tryWithLessThanZero).toThrow(InvalidArgumentError);
    });
  });
});
