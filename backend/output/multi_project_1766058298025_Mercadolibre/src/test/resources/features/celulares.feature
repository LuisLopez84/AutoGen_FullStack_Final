Feature: Celulares Automation

  Scenario: Escenario exitoso - Buscar celulares
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'celulares' en la barra de búsqueda"
    Then "debe ver una lista de resultados de búsqueda"

  Scenario: Escenario exitoso - Filtrar por marca
    Given "el usuario navega a la página de resultados de búsqueda de celulares"
    When "el usuario selecciona la marca 'Honor'"
    Then "debe ver resultados filtrados por la marca seleccionada"

  Scenario: Escenario de error - Buscar un producto inexistente
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'producto_inexistente' en la barra de búsqueda"
    Then "debe ver un mensaje de error indicando que no se encontraron resultados"