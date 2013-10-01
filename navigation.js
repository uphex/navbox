function changed(element,maxresults){
    if(element.find('input').val()===""){
        $('#navigationpanel').hide();
    }else{
        element.find(".ajax-loader").show();
        $.get('search.json','q='+encodeURIComponent(element.find('input').val()),function(result){
            element.find(".ajax-loader").hide();
            if($('#navigationpanel').length==0){
                $('<div id="navigationpanel"/>').appendTo($(document.body));
            }
            
            if(element.find('input').is(":focus")){
            
                var navigationpanel=$('#navigationpanel');
                navigationpanel.show();
                element.find('.closetext').show();
                navigationpanel.empty();
                navigationpanel.css('top',element.find('input')[0].getBoundingClientRect().bottom+'px');
                navigationpanel.css('left',element.find('input')[0].getBoundingClientRect().left+'px');
                var res=JSON.parse(result);
                if(res.results.length==0){
                    $('<div class="noresults">No results</div>').appendTo(navigationpanel);
                }
                
                var groupTable=$('<tbody/>').appendTo($('<table/>').appendTo(navigationpanel));
                var elementsGrouped=_.groupBy(_.first(res.results,maxresults),"type");
                _.each(_.keys(elementsGrouped),function(key,index,list){
                    var first=true;
                    _.each(elementsGrouped[key],function(element){
                        var row=$('<tr class="result"></tr>').appendTo(groupTable);
                        $('<td>'+(first?key:'')+'</td>').appendTo(row);
                        $('<td>'+(element.logo?'<img src="'+element.logo.src+'"/>':'')+'</td>').appendTo(row);
                        $('<td>'+element.name+'</td>').appendTo(row);
                        if(element.summary){
                            if(element.summary.type=="link"){
                                $('<td><a href="'+element.summary.src+'">'+element.summary.value+'</a></td>').appendTo(row);
                            }else{
                                $('<td><div class="healthbar"><div class="healthbar_inner" style="height:100%;width:'+(element.summary.value*100)+'%;background-color:'+(element.summary.status=="good"?'green':element.summary.status=="warning"?'orange':'red')+'"/></div></td>').appendTo(row);
                            }
                        }else{
                            $('<td/>').appendTo(row);
                        }
                        
                        row.find('td:gt(0)').hover(function(){
                            row.find('td:gt(0)').addClass('hover');
                        },function(){
                            row.find('td:gt(0)').removeClass('hover');
                        });
                        
                        row.find('td:gt(0)').click(function(a){
                            if($(a.toElement).prop("tagName").toUpperCase()!="A"){
                                window.location.href=element.src;
                            }
                        });
                        first=false;
                    });
                    if(index!=list.length-1){
                        $('<tr class="separator"><td colspan="4"/></tr>').appendTo(groupTable);
                    }
                });
                
                if(res.results.length>maxresults){
                    $('<a class="seemore" href="search?q='+encodeURIComponent(element.find('input').val())+'">See more...</a>').appendTo(navigationpanel);
                }
            }
        });
    }
}
    
function navbox(element,def,maxresults){
    element.addClass('navigation');
    var span=$('<span/>').text(def);
    var input=$('<input type="text" onclick="select()">').appendTo(element).hide();
    
    $('<img src="ajax-loader.gif" class="ajax-loader"/>').appendTo(element).hide();
    var closetext=$('<span class="closetext">X</span>').appendTo(element).hide();    
        
    span.click(function(){
        span.hide();
        input.show();
        //For debounce
        var timer;
        input.bind('input',function(){
            if(timer) clearTimeout(timer);
            timer = setTimeout(function(){changed(element,maxresults);}, 300);
        });
        input.val(def);

        
        var hidenavigation=function(){
            $('#navigationpanel').hide();
            input.val(def);
            closetext.hide();
            span.show();
            input.hide();
        }
        
        closetext.click(function(){
            hidenavigation();
        });
        
        input.blur(function(){
            setTimeout(function(){
                hidenavigation();
            },100);
    
        });
        
        input.select();
    });
    span.appendTo(element);
    
    
}