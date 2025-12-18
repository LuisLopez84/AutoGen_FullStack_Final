Feature: Televisores Automation

  Scenario: Escenario exitoso - Buscar televisores
    Given "el usuario navega a la página principal de Mercado Libre"
    When "busca 'televisores' en la barra de búsqueda"
    Then "debe ver una lista de resultados de búsqueda"

  Scenario: Escenario exitoso - Seleccionar un televisor
    Given "el usuario navega a la página de resultados de búsqueda de televisores"
    When "selecciona un televisor de la lista"
    Then "debe ver la página de detalles del televisor"

  Scenario: Escenario de error - Buscar un producto inexistente
    Given "el usuario navega a la página principal de Mercado Libre"
    When "busca 'producto_inexistente' en la barra de búsqueda"
    Then "debe ver un mensaje de error indicando que no se encontraron resultados"