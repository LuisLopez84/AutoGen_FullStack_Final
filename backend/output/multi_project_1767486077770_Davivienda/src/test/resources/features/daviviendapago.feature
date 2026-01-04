Feature: DaviviendaPago Automation

  Scenario: Escenario exitoso - Realizar un pago
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona el servicio de Acueducto La Herradura
    And el usuario ingresa el número de papel '11100012354'
    And el usuario ingresa el total a pagar '$10'
    Then el usuario debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario exitoso - Realizar un pago con un monto diferente
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona el servicio de Acueducto La Herradura
    And el usuario ingresa el número de papel '111000123'
    And el usuario ingresa el total a pagar '$1'
    Then el usuario debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario de error - Realizar un pago con un número de papel inválido
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona el servicio de Acueducto La Herradura
    And el usuario ingresa un número de papel inválido 'invalid_number'
    And el usuario ingresa el total a pagar '$10'
    Then el usuario debe ver un mensaje de error indicando que el número de papel es inválido