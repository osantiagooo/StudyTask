// Responsabilidade de gerenciar as rotas da aplicação e ativar links no menu.

export function initRouter(onRouteChange) {
  document
    .querySelectorAll('#main-nav [data-route]')
    .forEach(link => {

      link.addEventListener('click', event => {
        event.preventDefault();

        const route = link.getAttribute('data-route');

        document
          .querySelectorAll('#main-nav .nav-link')
          .forEach(navLink => {
            navLink.classList.remove('active');
            navLink.removeAttribute('aria-current');
          });

        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        onRouteChange(route);
      });

    });
}
