# 📸 Pasta de Imagens

Esta pasta contém todas as imagens estáticas do projeto.

## 📁 Estrutura de Pastas

```
images/
├── gems/          # Imagens relacionadas às GEMs (IAs especializadas)
├── calendar/      # Imagens do calendário e plantões
├── dashboard/     # Imagens do dashboard principal
├── icons/         # Ícones customizados
├── logos/         # Logos e marcas
└── backgrounds/   # Imagens de fundo e backgrounds
```

## 📝 Como Usar

### Imagens Públicas (public/images/)
Para imagens que serão acessadas diretamente via URL:

```tsx
// Exemplo: /images/gems/medicina.jpg
<img src="/images/gems/medicina.jpg" alt="Medicina" />
```

### Imagens Importadas (src/assets/images/)
Para imagens que serão importadas no código (otimizadas pelo Next.js):

```tsx
import medicinaImage from '@/assets/images/medicina.jpg';

<img src={medicinaImage.src} alt="Medicina" />
```

## 🎨 Formatos Recomendados

- **WebP** - Melhor compressão e qualidade (recomendado)
- **PNG** - Para imagens com transparência
- **JPG** - Para fotos e imagens complexas
- **SVG** - Para ícones e ilustrações vetoriais

## 📏 Tamanhos Recomendados

- **Logos**: 200x200px a 400x400px
- **Ícones**: 24x24px a 64x64px
- **Imagens de fundo**: 1920x1080px (Full HD)
- **Thumbnails**: 300x300px a 500x500px

## ✅ Checklist ao Adicionar Imagens

- [ ] Imagem otimizada (comprimida)
- [ ] Nome descritivo (ex: `medicina-cardiacologia.jpg`)
- [ ] Tamanho adequado para web (< 500KB idealmente)
- [ ] Formato apropriado (WebP quando possível)
- [ ] Alt text definido no código

