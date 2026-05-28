import { mount } from 'svelte';
import App from './app/App.svelte';
import './styles.css';

const target = document.getElementById('app');

if (!target) {
  throw new Error('10K Forge failed to start: #app element was not found.');
}

const app = mount(App, { target });

export default app;
