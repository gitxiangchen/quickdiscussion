define(['app/app'], function(app){
    'use restrict';

    var filterName = 'forumTopicNameFilter';
    var forumTopicNameFilter = function () {

        return function(topics, filterValue){
            if (!filterValue) return topics;

            var matches = [];
            filterValue = filterValue.toLowerCase();
            for (i = 0; i < topics.length; i++) {
                var topic = topics[i];
                if (topic.Title && topic.Title.toLowerCase().indexOf(filterValue) > -1){
                    matches.push(topic);
                }
            }

            return matches;
        }

    };

    app.filter(filterName, forumTopicNameFilter);
})