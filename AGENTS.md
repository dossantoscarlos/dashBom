<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Arquitetura de Módulos (CoreModules)

Todos os módulos funcionais independentes do sistema devem ser criados dentro do diretório `/CoreModules` na raiz do projeto.

### Regras de Estrutura:
1. **Isolamento:** Cada módulo deve ter sua própria pasta (ex: `/CoreModules/Campaigns`).
2. **Componentes:** O componente principal de visualização do módulo deve residir nesta pasta.
3. **Independência:** Módulos devem ser projetados para funcionar de forma independente, utilizando o `ModuleBlock` para padronização visual.
4. **Caminhos:** Ao criar novos recursos, utilize o diretório `/CoreModules` como base para a lógica de negócio específica daquele módulo.
<!-- END:nextjs-agent-rules -->
