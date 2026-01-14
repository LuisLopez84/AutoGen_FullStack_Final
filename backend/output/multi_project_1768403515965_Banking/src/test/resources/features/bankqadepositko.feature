Feature: BankQADepositKO Automation

  Scenario: Escenario exitoso - Depósito de dinero válido
    Given el usuario navega a la página de inicio de sesión
    When el usuario ingresa su correo electrónico 'admin@demobankltd.com'
    And el usuario ingresa su contraseña válida
    And el usuario inicia sesión
    And el usuario navega a la sección de cuentas
    And el usuario selecciona la cuenta para realizar un depósito
    And el usuario ingresa un monto de depósito válido '1000'
    And el usuario confirma el depósito
    Then el sistema debe mostrar un mensaje de éxito

  Scenario: Escenario exitoso - Depósito de dinero mínimo
    Given el usuario navega a la página de inicio de sesión
    When el usuario ingresa su correo electrónico 'admin@demobankltd.com'
    And el usuario ingresa su contraseña válida
    And el usuario inicia sesión
    And el usuario navega a la sección de cuentas
    And el usuario selecciona la cuenta para realizar un depósito
    And el usuario ingresa un monto de depósito mínimo '1'
    And el usuario confirma el depósito
    Then el sistema debe mostrar un mensaje de éxito

  Scenario: Escenario de error - Depósito de dinero negativo
    Given el usuario navega a la página de inicio de sesión
    When el usuario ingresa su correo electrónico 'admin@demobankltd.com'
    And el usuario ingresa su contraseña válida
    And el usuario inicia sesión
    And el usuario navega a la sección de cuentas
    And el usuario selecciona la cuenta para realizar un depósito
    And el usuario ingresa un monto de depósito negativo '-100'
    And el usuario confirma el depósito
    Then el sistema debe mostrar un mensaje de error