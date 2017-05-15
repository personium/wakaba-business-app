$(function(){
  // tab
  // 1page1tabまで（暫定）
  $(document).on("click", ".tab a", function(){
    var tab_id = $(this).attr("href");
    var tabs = $($(this).parents(".tab")[0]);
    tabs.find("li").removeClass('current');
    $(".tab-content").hide();
    $(tab_id).show();
    $(this).parent("li").addClass('current');
    return false;
  });
  // switcher
  // 1page1switcherまで（暫定）
  $(document).on("click", ".switch-trigger", function(){
    var sw_id = $(this).attr("href");
    $(".switch-pages").hide();
    $(sw_id).show();
    return false;
  });
  // サイドナビのカレントクリック
  $(document).on("click", ".side-nav .current a", function(){
    return false;
  });


});