function changed(element,maxresults){
    //For empty text, no result will be shown
    if(element.find('input').val()===""){
        $('#navigationpanel').hide();
    }else{
        element.find(".ajax-loader").show();
        $.get('search.json','q='+encodeURIComponent(element.find('input').val()),function(result){
            element.find(".ajax-loader").hide();
            //If the navigation panel is not present, create it
            if($('#navigationpanel').length===0){
                $('<div id="navigationpanel"/>').appendTo($(document.body));
            }
            
            //If the input has lost focus since the AJAX was initiated, then no result is shown
            if(element.find('input').is(":focus")){
            
                var navigationpanel=$('#navigationpanel');
                navigationpanel.show();
                element.find('.closetext').show();
                navigationpanel.empty();
                navigationpanel.css('top',element.find('input')[0].getBoundingClientRect().bottom+'px');
                navigationpanel.css('left',element.find('input')[0].getBoundingClientRect().left+'px');
                
                var res;
                if (typeof result === 'string') {
                    res=JSON.parse(result);
                } else {
                    res=result;
                }

                if(res.results.length===0){
                    $('<div class="noresults">No results</div>').appendTo(navigationpanel);
                }
                
                var groupTable=$('<tbody/>').appendTo($('<table/>').appendTo(navigationpanel));
                var elementsGrouped=_.groupBy(_.first(res.results,maxresults),"type");
                _.each(_.keys(elementsGrouped),function(key,index,list){
                    //It indicates that this is the first row for the group, thus the group name should be added too
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
                        
                        //Hover handling, :hover is not efficient, as not all tds are needed to be shaded
                        row.find('td:gt(0)').hover(function(){
                            row.find('td:gt(0)').addClass('hover');
                        },function(){
                            row.find('td:gt(0)').removeClass('hover');
                        });
                        
                        //Clicking on an anchor should navigate to the anchor's href
                        row.find('td:gt(0)').click(function(a){
                            if($(a.toElement).prop("tagName").toUpperCase()!="A"){
                                window.location.href=element.src;
                            }
                        });
                        first=false;
                    });
                    
                    //After the last group, no separator is needed
                    if(index!=list.length-1){
                        $('<tr class=""><td colspan="4"><hr/></td>></tr>').appendTo(groupTable);
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
    //Span before clicked
    var span=$('<div class="placeholder"><img src="search.png" class="searchicon"/><span>'+def+'</span><img src="select.png" class="selecticon"/></div>');
    //Input after clicked
    var input=$('<input type="text" onclick="select()">').appendTo(element).hide();
    
    $('<img src="ajax-loader.gif" class="ajax-loader"/>').appendTo(element).hide();
    var closetext=$('<span class="closetext">X</span>').appendTo(element).hide();
        
    span.click(function(){
        //span.hide();
        span.css("color", "transparent");
        input.width((element.width()-30)+'px');
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
            //span.show();
            span.removeAttr("style");
            input.hide();
        };
        
        closetext.click(function(){
            hidenavigation();
        });
        
        input.blur(function(){
            //Hacky, needed because without it the click events wouldn't be firing to navigate away
            setTimeout(function(){
                hidenavigation();
            },100);
    
        });
        
        input.select();
    });
    span.appendTo(element);
    
    
}