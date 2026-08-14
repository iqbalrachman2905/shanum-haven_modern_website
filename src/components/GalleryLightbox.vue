<script setup>
import { ref, onUnmounted, watch } from 'vue';

const props = defineProps({
  items: { type: Array, required: true }
});

const activeIndex = ref(null);
let touchStartX = 0;

function open(i) {
  activeIndex.value = i;
}
function close() {
  activeIndex.value = null;
}
function next() {
  if (activeIndex.value === null) return;
  activeIndex.value = (activeIndex.value + 1) % props.items.length;
}
function prev() {
  if (activeIndex.value === null) return;
  activeIndex.value = (activeIndex.value - 1 + props.items.length) % props.items.length;
}

function onKeydown(e) {
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
}

function onTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX;
}
function onTouchEnd(e) {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 40) return; // bukan swipe beneran, cuma tap
  delta > 0 ? prev() : next();
}

watch(activeIndex, (val) => {
  if (val !== null) {
    window.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    window.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="gallery-grid">
    <figure 
      v-for="(item, i) in items" 
      :key="item.id" 
      class="gallery-item"
      @click="open(i)"
    >
      <img :src="item.thumbSrc" :alt="item.caption || 'Foto properti'" loading="lazy" />
      <figcaption v-if="item.caption">{{ item.caption }}</figcaption>
    </figure>
  </div>

  <div 
    v-if="activeIndex !== null" 
    class="lightbox"
    @click.self="close"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <button class="lb-close" @click="close" aria-label="Tutup galeri">&times;</button>
    
    <button class="lb-nav lb-prev" @click="prev" aria-label="Foto sebelumnya">&#8249;</button>
    <img :src="items[activeIndex].fullSrc" :alt="items[activeIndex].caption || ''" class="lb-image" />
    <button class="lb-nav lb-next" @click="next" aria-label="Foto selanjutnya">&#8250;</button>

    <p v-if="items[activeIndex].caption" class="lb-caption">{{ items[activeIndex].caption }}</p>
  </div>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-sm);
}
.gallery-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  position: relative;
  cursor: pointer;
  margin: 0;
}
.gallery-item img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}
.gallery-item:hover img {
  transform: scale(1.04);
}
.gallery-item figcaption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, color-mix(in srgb, var(--color-primary) 75%, transparent), transparent);
  color: var(--color-bg-main);
  font-size: 0.78rem;
  padding: 20px 10px 8px;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--color-primary) 94%, transparent);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}
.lb-image {
  max-width: min(90vw, 900px);
  max-height: 75vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}
.lb-caption {
  color: var(--color-bg-main);
  margin-top: var(--space-sm);
  font-size: 0.9rem;
}

.lb-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  background: none;
  border: none;
  color: var(--color-bg-main);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}
.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--color-bg-main) 15%, transparent);
  border: none;
  color: var(--color-bg-main);
  font-size: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
}
.lb-prev { left: var(--space-sm); }
.lb-next { right: var(--space-sm); }

@media (min-width: 640px) {
  .lb-prev { left: var(--space-lg); }
  .lb-next { right: var(--space-lg); }
}
</style>
