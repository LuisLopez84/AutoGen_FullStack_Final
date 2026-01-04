Feature: DaviviendaPago2 Automation

  Scenario: Escenario exitoso - Realizar un pago válido
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa un número de cuenta válido
    And ingresa un monto válido
    Then el usuario debe ver un mensaje de pago exitoso

  Scenario: Escenario exitoso - Realizar un pago con monto cero
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa un número de cuenta válido
    And ingresa un monto de cero
    Then el usuario debe ver un mensaje de error indicando que el monto no puede ser cero

  Scenario: Escenario de error - Realizar un pago con número de cuenta inválido
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa un número de cuenta inválido
    And ingresa un monto válido
    Then el usuario debe ver un mensaje de error indicando que el número de cuenta es inválido