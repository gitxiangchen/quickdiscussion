define(["require", "exports"], function(require, exports) {
    exports.strings = {
        language: "en",
        locale: "en-US",
        app: {
            general: {
                required: "Required",
                requiredField: "Required Field",
                busy: "Please wait ...",
                submitButton: "Submit",
                cancelButton: "Cancel"
            },
            dashboard: {
                title: "Dashboard",
                activeThread: "Active Threads",
                activeForum: "Active Forums",
                forumTitle: "Forums",
                noForum: "No forum found",
                noTopic: "No discussion topic found",
                noThread: "No discussion thread found"
            },
            services: {
                user: {
                    getCurrentUserError: "Failed to get current user: {{error}}"
                }
            },
            topnav: {
                hostWeb: "Quick Discussion",
                admin: "Administration",
                home: "Home",
                userPosts: "Posts",
                language: {
                    main: "Languages",
                    english: "English",
                    chinese: "中文",
                    auto: "Auto"
                },
                customization: "Customization",
                manageForum: "Manage Forums",
                returnToSite: "Return to SharePoint Site",
                about: {
                    title: "About",
                    okButton: "Ok"
                },
                tooltip: {
                    addYourOwn: "Customize to add your own brand"
                },
                search: {
                    title: "Search",
                    go: "Go!"
                }
            },
            search: {
                result: "Search results",
                searchForum: "Search forum...",
                searchThread: "Search thread...",
                titleHeader: "Title",
                summaryHeader: "Summary",
                authorHeader: "Author"
            },
            customization: {
                invalidSettings: "Missing forum site settings:  {{error}}",
                loggingLevelApplied: "Successfully applied the logging level: {{level}}"
            },
            forum: {
                title: "Forums",
                dashboard: "Discussion Forums",
                topic: "Discussion Board",
                discussion: "Discussion Topic",
                thread: "Discussion Threads",
                newTopic: "New Topic",
                headerTopic: "Topic",
                headerLastUpdatedBy: "Last Reply By",
                headerLastUpdated: "Last Updated",
                manage: {
                    title: "Manage Forums",
                    save: "Update",
                    saveNew: "Create",
                    deleteForum: "Delete",
                    cancel: "Cancel",
                    newForum: "Create Forum",
                    editForum: "Edit Forum",
                    editButton: "Edit",
                    importButton: "Import",
                    titleRequired: "forum title must be specified",
                    onHostWeb: "Forum created on host site",
                    gotoForumTooltip: "Visit discussion forum",
                    onHostWebTooltip: "Discussion forum created on host web stays after App uninstallation",
                    imports: {
                        search: "Search in the cloud for import",
                        selectSource: "Select cloud source for import",
                        requireSource: "You must select a cloud source",
                        requireSourceQuery: "You must select a search term for the cloud source",
                        searchResultHeaders: {
                            topic: "Topic",
                            message: "Message Count"
                        },
                        steps: {
                            target: "Target",
                            targetButton: "Go Back",
                            targetDescription: "You have selected to import discussion topics/threads to forum General Forum. Click button to make a change of target forum.",
                            source: "Source",
                            sourceButton: "Select",
                            sourceDescription: "Click the button below to select the source, and then select topics/threads that you want to import.",
                            finish: "Import",
                            finishButton: "Go",
                            finishDescription: "Click the button below to start the import process. This may take some time so please be patient."
                        }
                    }
                }
            },
            discussion: {
                timeline: "Timeline View",
                flat: "Flat View",
                tree: "Threaded View",
                reply: "Reply",
                edit: "Edit",
                remove: "Delete",
                cancel: "Cancel",
                postReply: "Post Reply",
                bestAnswer: "Best answer",
                deleteBestAnswer: "Delete best answer",
                quickReply: "Click to write your reply quickly"
            },
            topic: {
                subject: "Subject",
                message: "Message",
                title: "New Thread",
                bodyRequired: "Required!",
                subjectRequired: "Required!",
                isQuestion: "asking a question and want to get answers"
            },
            user: {
                currentUserError: "Failed to load current user info: {{error}}",
                currentUserPermissionsError: "Failed to load current user permissions: {{error}}",
                specifiedUserPermissionsError: "Failed to load user permissions for the user '{{user}}': {{error}}"
            }
        }
    };
    return exports.strings;
});
