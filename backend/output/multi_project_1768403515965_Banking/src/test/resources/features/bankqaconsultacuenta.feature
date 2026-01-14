Feature: BankQAConsultaCuenta Automation

  Scenario: Escenario exitoso - Consulta de cuenta con credenciales válidas
    Given el usuario navega a la página de inicio de sesión del banco
    When ingresa su correo electrónico 'admin@demobankltd.com'
    And ingresa su contraseña 'admin123'
    And hace clic en el botón de inicio de sesión
    Then debe ser redirigido a la página de consulta de cuenta

  Scenario: Escenario exitoso - Consulta de cuenta con otra cuenta válida
    Given el usuario navega a la página de inicio de sesión del banco
    When ingresa su correo electrónico 'user@demobankltd.com'
    And ingresa su contraseña 'user123'
    And hace clic en el botón de inicio de sesión
    Then debe ser redirigido a la página de consulta de cuenta

  Scenario: Escenario de error - Consulta de cuenta con credenciales inválidas
    Given el usuario navega a la página de inicio de sesión del banco
    When ingresa su correo electrónico 'invalid@demobankltd.com'
    And ingresa su contraseña 'wrongpassword'
    And hace clic en el botón de inicio de sesión
    Then debe ver un mensaje de error 'Credenciales inválidas'