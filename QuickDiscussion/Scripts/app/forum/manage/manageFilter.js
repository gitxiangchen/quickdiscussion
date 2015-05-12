define(['app/app'], function(app){
    'use restrict';

    var filterName = 'forumName';
    var forumNameFilter = function (){

        return function(forums, filterValue){
            if (!filterValue) return forums;

            var matches = [];
            filterValue = filterValue.toLowerCase();
            for (i = 0; i < forums.length; i++) {
                var forum = forums[i];
                if (forum.name && forum.name.toLowerCase().indexOf(filterValue) > -1) {
                    matches.push(forum);
                }
            }

            return matches;
        }
    };

    app.filter(filterName, forumNameFilter);
})