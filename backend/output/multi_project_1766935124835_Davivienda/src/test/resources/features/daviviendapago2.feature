Feature: DaviviendaPago2 Automation

  Scenario: Escenario exitoso - Realizar un pago correcto
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa el número de cuenta '80814946'
    And ingresa el valor '100000'
    Then debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario exitoso - Realizar un pago con datos válidos
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa el número de cuenta '80814946'
    And ingresa el valor '50000'
    Then debe ver un mensaje de confirmación de pago exitoso

  Scenario: Escenario de error - Realizar un pago con número de cuenta inválido
    Given el usuario navega a la página principal de Davivienda
    When el usuario selecciona la opción de pago
    And ingresa un número de cuenta inválido '12345678'
    Then debe ver un mensaje de error indicando que el número de cuenta es inválido