// Responsabilidade de gerenciar as rotas da aplicação e ativar links no menu.
export function initRouter(onRouteChange) {
  document.querySelectorAll('#main-nav [data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-route');

      document.querySelectorAll('#main-nav .nav-link').forEach(l => {
        l.classList.remove('active');
        l.classList.add('text-dark');
      });
      link.classList.add('active');
      link.classList.remove('text-dark');

      onRouteChange(route);
    });
  });
}
