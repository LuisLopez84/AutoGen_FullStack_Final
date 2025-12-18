Feature: Com Automation

  Scenario: Escenario exitoso - Buscar computadores
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario ingresa 'computadores' en la barra de búsqueda"
    Then "el usuario debe ver una lista de resultados de búsqueda"

  Scenario: Escenario exitoso - Seleccionar un producto
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'computadores' y selecciona un producto"
    Then "el usuario debe ser redirigido a la página del producto"

  Scenario: Escenario de error - Búsqueda vacía
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario no ingresa ningún texto en la barra de búsqueda y presiona buscar"
    Then "el usuario debe ver un mensaje de error indicando que la búsqueda no puede estar vacía"