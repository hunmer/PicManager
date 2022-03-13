var g_menu = {
    init: () => {
        var list = `
          <i data-action="showContent,gallery" class="fa fa-home fa-2x" aria-hidden="true"></i>
            <i data-action="showContent,detail" class="fa fa-photo fa-2x" aria-hidden="true"></i>
            <i data-action="showContent,site" class="fa fa-internet-explorer fa-2x" aria-hidden="true"></i>
            <i data-action="showContent,room" class="fa fa-gamepad fa-2x" aria-hidden="true"></i>
            `;
        $(`<div class="menu" id="menu_main">
            <i onclick="g_menu.toggleMenu('#menu_main', false)" class="fa fa-arrow-left fa-2x hide" aria-hidden="true"></i>
            ${list}
            <i onclick="g_menu.toggleMenu('#menu_main', true)" class="fa fa-arrow-right fa-2x" aria-hidden="true"></i>
        </div>`).appendTo('body');
        $('.sidebar-content').html(`
             <div class="w-full" style="display: flex;align-items: center;    justify-content: space-between;">
             ${list}
            </div>
        `);
    },

    showMenu: function(id, show) {
        var sideWidth = isSidebarShowed() ? $('.sidebar').width() : '0';
        $(id + ' .fa-arrow-left').toggleClass('hide', true);

        $(id).css({
            left: `calc((100vw + ${sideWidth}px) / 2 - ${$(id).width() / 2}px)`,
            right: 'unset',
            display: show ? '' : 'none'
        });
    },

    toggleMenu: function(id, hide) {
        $(id + ' .fa-arrow-left').toggleClass('hide', !hide);
        if (!hide) {
            return this.showMenu(id, true);
        }

        $(id).css({
            right: hide ? 0 - ($(id).width() - 20) + 'px' : 'unset',
            left: hide ? 'unset' : '',
        });
    },
    isMenuShow: function(id){
        return $('#'+id).css('display') != 'none';
    },
    isInSlider: function(id) {
        return !this.isMenuShow(id) && $('#'+id)[0].style.left == 'unset';
    },

}
g_menu.init();