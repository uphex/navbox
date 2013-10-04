function changed(element,maxresults,value){
    element.find(".ajax-loader").show();
    $.get('search.json','q='+encodeURIComponent(value),function(result){
        element.find(".ajax-loader").hide();
        //If the navigation panel is not present, create it
        if($('#navigation-panel').length===0){
            $('<div id="navigation-panel"/>').appendTo($(document.body));
        }

        //If the input has lost focus since the AJAX was initiated, then no result is shown
        if(element.find('input').is(":focus")){

            var navigation_panel=$('#navigation-panel');
            navigation_panel.show();
            element.find('.close-text').show();
            navigation_panel.empty();
            navigation_panel.css('top',element.find('input')[0].getBoundingClientRect().bottom+'px');
            navigation_panel.css('left',element.find('input')[0].getBoundingClientRect().left+'px');

            var res;
            if (typeof result === 'string') {
                res=JSON.parse(result);
            } else {
                res=result;
            }

            if(res.results.length===0){
                $('<div class="no-results">No results</div>').appendTo(navigation_panel);
            }

            var group_table=$('<tbody/>').appendTo($('<table/>').appendTo(navigation_panel));
            var elements_grouped=_.groupBy(_.first(res.results,maxresults),"type");
            _.each(_.keys(elements_grouped),function(key,index,list){
                //It indicates that this is the first row for the group, thus the group name should be added too
                var first=true;
                _.each(elements_grouped[key],function(element){
                    var row=$('<tr class="result"></tr>').appendTo(group_table);
                    $('<td>'+(first?key:'')+'</td>').appendTo(row);
                    $('<td>'+(element.logo?'<img src="'+element.logo.src+'"/>':'<div class="image-placeholder"/>')+'</td>').appendTo(row);
                    $('<td>'+element.name+'</td>').appendTo(row);
                    if(element.summary){
                        if(element.summary.type=="link"){
                            $('<td><a href="'+element.summary.src+'">'+element.summary.value+'</a></td>').appendTo(row);
                        }else{
                            $('<td><div class="health-bar"><div class="health-bar-inner" style="height:100%;width:'+(element.summary.value*100)+'%;background-color:'+(element.summary.status=="good"?'green':element.summary.status=="warning"?'orange':'red')+'"/></div></td>').appendTo(row);
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
                    $('<tr><td colspan="4"><hr/></td>></tr>').appendTo(group_table);
                }
            });

            if(res.results.length>maxresults){
                $('<a class="see-more" href="search?q='+encodeURIComponent(value)+'">See more...</a>').appendTo(navigation_panel);
            }
        }
    });
}

/**
 *
 * @param element The element to put the navbox to
 * @param def The default string displayed
 * @param maxresults The maximum results to show in the results
 */
function navbox(element,def,maxresults){
    element.addClass('navigation');
    //Span before clicked
    var placeholder=$('<div class="placeholder"><img src="search.png" class="search-icon"/><span>'+def+'</span><img src="select.png" class="select-icon"/></div>');
    //Input after clicked
    var input=$('<input type="text" onclick="select()">').appendTo(element).hide();
    
    $('<img src="ajax-loader.gif" class="ajax-loader"/>').appendTo(element).hide();
    var closetext=$('<span class="close-text">X</span>').appendTo(element).hide();
        
    placeholder.click(function(){
        //span.hide();
        placeholder.css("color", "transparent");
        input.width((element.width()-30)+'px');
        input.show();
        /** For debounce */
        var timer;
        input.bind('input',function(){
            if(timer) clearTimeout(timer);
            timer = setTimeout(function(){
                if(element.find('input').val()===""){
                    $('#navigation-panel').hide();
                }else{
                    changed(element,maxresults,element.find('input').val());
                }
            }, 300);
        });
        input.val(def);

        var hidenavigation=function(){
            $('#navigation-panel').hide();
            input.val(def);
            closetext.hide();
            placeholder.removeAttr("style");
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

        changed(element,maxresults,"");
    });
    placeholder.appendTo(element);
    
    
}