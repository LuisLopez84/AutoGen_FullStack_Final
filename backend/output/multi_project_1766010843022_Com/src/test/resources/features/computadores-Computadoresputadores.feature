Feature: Computadores Automation

  Scenario: Escenario exitoso - Buscar computadores
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'computadores' en la barra de búsqueda
    And el usuario envía el formulario de búsqueda
    Then debe ver una lista de resultados de búsqueda de computadores

  Scenario: Escenario exitoso - Seleccionar un computador
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'computadores'
    And el usuario selecciona un computador de la lista
    Then debe ver la página de detalles del computador seleccionado

  Scenario: Escenario de error - Buscar un producto inexistente
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'producto_inexistente' en la barra de búsqueda
    And el usuario envía el formulario de búsqueda
    Then debe ver un mensaje de error indicando que no se encontraron resultados