# Computer Vision Processing Lab
**Project Scope — Version 1.0**

## 1. Visão geral

**Nome:** Computer Vision Processing Lab  
**Tipo:** Aplicação web interativa e experimental  
**Área:** Computer Vision / Digital Image Processing  
**Objetivo:** Portfólio técnico e preparação para Iniciação Científica  
**Repositório sugerido:** `computer-vision-processing-lab`

### 1.1 Objetivo geral

Desenvolver uma plataforma web capaz de aplicar, visualizar e comparar algoritmos clássicos de processamento digital de imagens, permitindo compreender suas operações, características matemáticas, limitações e aplicações práticas.

### 1.2 Objetivos específicos

- Implementar diferentes métodos de processamento espacial e no domínio da frequência.
- Demonstrar conceitos de representação de imagens, canais de cor, pixels e histogramas.
- Permitir a manipulação interativa de parâmetros dos algoritmos.
- Comparar a eficácia de diferentes métodos de filtragem e detecção de bordas.
- Medir o desempenho computacional dos algoritmos.
- Elaborar experimentos reproduzíveis e documentar resultados.

## 2. Escopo funcional

### Módulo 01 — Image Input & Visualization

Implementar um sistema de carregamento e visualização de imagens.

**Funcionalidades:**
- Upload de imagens PNG, JPG e JPEG.
- Seleção de imagens de exemplo.
- Exibição da imagem original e da imagem processada lado a lado.
- Visualização das dimensões, resolução, canais e tamanho do arquivo.
- Zoom e inspeção visual de detalhes.
- Botão para restaurar a imagem original.
- Download do resultado em PNG.

**Conceitos abordados:** matriz de pixels, imagens RGB, resolução espacial, profundidade de cor e representação digital.

### Módulo 02 — Color Space Processing

Implementar operações de transformação e análise de cores.

**Funcionalidades:**
- Conversão RGB → Grayscale.
- Conversão RGB → HSV.
- Conversão RGB → LAB.
- Separação e visualização dos canais de cada espaço de cor.
- Ajustes de brilho, contraste e gamma.
- Visualização dos histogramas de intensidade e de canais.

**Conceitos abordados:** modelos de representação de cores, luminância, canais, distribuições de intensidade e transformações de cor.

### Módulo 03 — Spatial Filtering

Implementar filtros para suavização, redução de ruído e realce.

**Algoritmos:**
- Mean / Box Filter.
- Gaussian Blur.
- Median Filter.
- Bilateral Filter.
- Sharpening Filter.
- Laplacian Filter.

**Funcionalidades:**
- Ajustar o tamanho do kernel.
- Modificar o desvio-padrão dos filtros aplicáveis.
- Alternar entre diferentes filtros.
- Comparar resultados com a imagem original.
- Apresentar o tempo de processamento.

**Conceitos abordados:** convolução, kernels, redução de ruído, preservação de contornos e filtragem espacial.

### Módulo 04 — Edge Detection

Implementar métodos clássicos de extração de bordas.

**Algoritmos:**
- Sobel X.
- Sobel Y.
- Sobel Magnitude.
- Prewitt.
- Laplacian.
- Canny Edge Detection.

**Funcionalidades:**
- Configurar os thresholds do Canny.
- Ajustar parâmetros dos operadores.
- Visualizar as bordas em imagens binárias.
- Comparar detectores lado a lado.

**Conceitos abordados:** gradientes, derivadas, variações de intensidade e detecção de contornos.

### Módulo 05 — Thresholding & Morphology

Implementar métodos de segmentação básica e operações morfológicas.

**Algoritmos:**
- Binary Threshold.
- Adaptive Threshold.
- Otsu Thresholding.
- Erosion.
- Dilation.
- Opening.
- Closing.

**Funcionalidades:**
- Ajustar thresholds quando aplicável.
- Configurar kernels e elementos estruturantes.
- Visualizar máscaras binárias.
- Comparar os efeitos das operações.
- Contar componentes conectados em máscaras binárias.

**Conceitos abordados:** segmentação, binarização, operações morfológicas e componentes conectados.

### Módulo 06 — Frequency Domain Analysis (FFT)

Este será um dos principais diferenciais técnicos do projeto.

**Funcionalidades:**
- Converter uma imagem em escala de cinza para o domínio da frequência utilizando FFT 2D.
- Visualizar o espectro de magnitude em escala logarítmica.
- Centralizar a componente de frequência zero para facilitar a inspeção.
- Implementar filtros passa-baixa e passa-alta no domínio da frequência.
- Configurar o raio de corte de máscaras de frequência.
- Aplicar a transformada inversa (IFFT) para reconstruir a imagem.
- Comparar os resultados das filtragens no domínio espacial e no domínio da frequência.

**Conceitos abordados:** Transformada Discreta de Fourier, FFT, frequências espaciais, filtragem espectral, transformada inversa e reconstrução.

### Módulo 07 — Algorithm Comparison

Construir uma área específica para executar comparações entre algoritmos.

**Funcionalidades:**
- Selecionar uma imagem de entrada.
- Selecionar dois algoritmos.
- Configurar os parâmetros de cada um.
- Executar ambos com as mesmas condições de entrada.
- Exibir imagens comparativas.
- Registrar o tempo de execução.
- Apresentar métricas quantitativas quando aplicáveis.

**Métricas iniciais:**
- Tempo de processamento em milissegundos.
- PSNR, quando houver imagem de referência.
- SSIM, quando houver imagem de referência.
- MSE, quando houver imagem de referência.

### Módulo 08 — Experiment Export

Permitir que os experimentos realizados sejam registrados e reproduzidos.

**Funcionalidades:**
- Exportar imagens originais e processadas.
- Exportar os parâmetros utilizados em JSON.
- Exportar resultados quantitativos em CSV.
- Gerar uma ficha de experimento contendo algoritmo, parâmetros, métricas e identificador da imagem de entrada.
- Reproduzir uma configuração a partir de um JSON previamente exportado.

## 3. Arquitetura técnica

**Frontend**
- Next.js + TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Plotly.js para visualizações científicas.

**Backend**
- Python.
- FastAPI.
- OpenCV.
- NumPy.
- SciPy.
- scikit-image.

**Qualidade**
- Pytest para testes do processamento.
- Ruff para lint e formatação do código Python.
- Vitest para testes de componentes e utilitários.
- Playwright para testes dos fluxos principais.
- GitHub Actions para CI.

### 3.1 Organização arquitetural

Separar o processamento matemático e os algoritmos das camadas de apresentação e de comunicação HTTP.

Os métodos devem ser implementados como funções reutilizáveis e testáveis, sem dependência da interface gráfica.

### 3.2 Estrutura sugerida

- `frontend/`: aplicação Next.js.
  - `app/`: páginas e layouts.
  - `components/`: interface, visualizadores e controles.
  - `lib/`: cliente HTTP e utilitários.
  - `types/`: contratos TypeScript.
- `backend/`: API FastAPI.
  - `app/api/`: endpoints.
  - `app/core/`: configuração e validação.
  - `app/processing/`: algoritmos por categoria.
  - `app/metrics/`: métricas quantitativas.
  - `app/schemas/`: modelos de entrada e saída.
  - `tests/`: testes automatizados.
- `experiments/`: protocolos e resultados reproduzíveis.
- `samples/`: imagens de exemplo permitidas para redistribuição.
- `docs/`: documentação técnica e metodológica.

### 3.3 Endpoints principais

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/health` | Verificar funcionamento |
| GET | `/api/operations` | Consultar algoritmos e parâmetros |
| POST | `/api/process` | Aplicar um algoritmo |
| POST | `/api/compare` | Comparar duas configurações |
| POST | `/api/frequency` | Executar análise FFT |
| POST | `/api/metrics` | Calcular métricas com referência |

Para o MVP, não será necessário banco de dados nem autenticação.

## 4. Interface e experiência do usuário

A aplicação deve ter aparência de uma ferramenta técnica profissional, semelhante a um laboratório científico moderno.

**Direção visual:**
- Tema escuro com azul como cor principal de destaque.
- Layout responsivo.
- Tipografia técnica e legível.
- Gráficos com eixos, escalas e legendas.
- Animações sutis, sem prejudicar o desempenho.
- Interface inicialmente em inglês.

**Estrutura da interface:**
- Menu lateral: módulos de processamento.
- Painel principal: visualização e comparação de imagens.
- Painel lateral direito: parâmetros configuráveis.
- Painel inferior: histogramas, espectros, métricas e informações de execução.

O usuário deve conseguir experimentar um algoritmo sem precisar conhecer sua implementação interna, mas deve ter acesso a uma breve explicação de seu funcionamento.

## 5. Requisitos não funcionais

**Desempenho**
- Priorizar operações em CPU.
- Evitar processamento repetido ao alterar controles que não afetam o algoritmo.
- Exibir o tempo de processamento separadamente do tempo total da requisição.

**Segurança**
- Validar o conteúdo real dos arquivos enviados.
- Restringir tipos de arquivo, dimensões e tamanho de upload.
- Não executar conteúdo fornecido pelo usuário.
- Não armazenar imagens permanentemente no servidor por padrão.

**Confiabilidade**
- Tratar parâmetros inválidos.
- Documentar limites e condições de execução.
- Evitar erros silenciosos em operações de imagem.
- Preservar a imagem original durante os experimentos.

**Reprodutibilidade**
- Registrar parâmetros, versões de bibliotecas e condições dos experimentos.
- Utilizar sementes fixas nos experimentos com ruído sintético.
- Manter imagens de referência e configurações documentadas.

## 6. Experimentos científicos

### Experimento A — Noise Reduction

**Questão:** qual filtro apresenta melhor desempenho na remoção de diferentes tipos de ruído?

**Metodologia:**
1. Selecionar imagens limpas de referência.
2. Adicionar ruído gaussiano e impulsivo sintético.
3. Aplicar filtros Gaussian, Median e Bilateral.
4. Calcular PSNR e SSIM em relação à imagem limpa.
5. Comparar os resultados para diferentes intensidades de ruído.

### Experimento B — Edge Detection

**Questão:** como a escolha do detector e seus parâmetros afeta as bordas obtidas?

**Metodologia:**
1. Selecionar imagens com diferentes texturas e níveis de contraste.
2. Aplicar Sobel, Prewitt, Laplacian e Canny.
3. Variar os parâmetros dos operadores.
4. Comparar resultados visuais e estabilidade diante de ruído.
5. Quando houver anotações de bordas, avaliar Precision, Recall e F1 com uma tolerância espacial documentada.

### Experimento C — Frequency Filtering

**Questão:** como filtros no domínio da frequência alteram características visuais da imagem?

**Metodologia:**
1. Calcular FFT 2D de imagens selecionadas.
2. Inspecionar os espectros de magnitude.
3. Aplicar máscaras passa-baixa e passa-alta.
4. Variar as frequências de corte.
5. Reconstruir as imagens utilizando IFFT.
6. Comparar visualmente a filtragem e suas possíveis distorções, incluindo ringing.

**Observação:** cada experimento deverá conter hipótese, variáveis controladas, resultados, discussão e limitações.

## 7. Plano de desenvolvimento

| Etapa | Atividades | Entrega |
|---|---|---|
| Sprint 1 | Setup, API, upload, visualização, cores e histogramas | Aplicação funcional básica |
| Sprint 2 | Filtros espaciais, detectores de bordas, thresholds e morfologia | Biblioteca principal de algoritmos |
| Sprint 3 | FFT 2D, espectros, filtros de frequência e IFFT | Módulo avançado |
| Sprint 4 | Comparações, métricas, testes, experimentos e documentação | MVP completo e publicável |

A duração de cada sprint dependerá da disponibilidade para desenvolvimento e testes.

## 8. Funcionalidades futuras

Itens fora do MVP, reservados para versões posteriores:

- Processamento de vídeos e análise frame a frame.
- Captura em tempo real pela webcam.
- Construção de pipelines com múltiplos filtros encadeados.
- Seleção interativa de regiões de interesse (ROI).
- Comparação em lote sobre conjuntos de imagens.
- Benchmark entre implementações CPU e GPU.
- Histórico local de experimentos.
- Visualização didática de convoluções passo a passo.
- Exportação automática de relatórios em PDF.

## 9. Critérios de aceitação

O MVP será considerado concluído quando:

- O usuário conseguir enviar uma imagem válida e visualizar sua versão original.
- Os módulos principais de processamento funcionarem com parâmetros configuráveis.
- O espectro FFT for visualizado corretamente.
- A transformada inversa conseguir reconstruir a imagem dentro de uma tolerância numérica definida.
- A comparação entre dois algoritmos estiver funcional.
- PSNR, SSIM e MSE puderem ser calculados quando houver uma referência adequada.
- Os resultados e parâmetros puderem ser exportados.
- Os algoritmos principais possuírem testes automatizados.
- Pelo menos três experimentos documentados estiverem disponíveis.
- O repositório possuir README, instruções de instalação, exemplos e demonstrações visuais.

## 10. Entregáveis finais

1. Aplicação web funcional.
2. Backend modular de processamento de imagens.
3. Biblioteca de algoritmos com testes.
4. Três estudos experimentais documentados.
5. Gráficos e tabelas comparativas.
6. Documentação da arquitetura e das decisões técnicas.
7. README técnico em inglês.
8. Vídeo curto demonstrando o software.
9. Repositório público organizado para portfólio.

## 11. Evolução acadêmica

O projeto poderá servir de base para uma investigação sobre a influência de técnicas de pré-processamento na robustez de sistemas de visão computacional.

Em uma segunda etapa, será possível estudar como filtros, transformações de cores e técnicas no domínio da frequência afetam o desempenho de algoritmos de detecção ou segmentação baseados em aprendizado de máquina.