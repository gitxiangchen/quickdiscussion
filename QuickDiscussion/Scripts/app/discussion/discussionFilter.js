define(['app/app'], function(app){
    'use restrict';

    var discussionNameFilter = function (){

        return function(discussions, filterValue){
            if (!filterValue) return discussions;

            var matches = [];
            filterValue = filterValue.toLowerCase();
            for (i = 0; i < discussions.length; i++) {
                var discussion = discussions[i];
                if (discussion.Title && discussion.Title.toLowerCase().indexOf(filterValue) > -1){
                    matches.push(discussion);
                }
            }

            return matches;
        }

    };

    app.filter('discussionNameFilter', discussionNameFilter);
})