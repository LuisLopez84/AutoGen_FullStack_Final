Feature: DaviviendaPago Automation

  Scenario: Escenario exitoso - Realizar un pago correcto
    Given el usuario navega a la página principal de Davivienda
    When selecciona el servicio de Acueducto La Herradura
    And ingresa el número de papel '11100012354'
    And ingresa el total a pagar '$ 10'
    Then debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario exitoso - Realizar un pago con un monto diferente
    Given el usuario navega a la página principal de Davivienda
    When selecciona el servicio de Acueducto La Herradura
    And ingresa el número de papel '111000123'
    And ingresa el total a pagar '$ 1'
    Then debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario de error - Realizar un pago con número de papel inválido
    Given el usuario navega a la página principal de Davivienda
    When selecciona el servicio de Acueducto La Herradura
    And ingresa el número de papel 'invalid_number'
    And ingresa el total a pagar '$ 10'
    Then debe ver un mensaje de error indicando que el número de papel es inválido