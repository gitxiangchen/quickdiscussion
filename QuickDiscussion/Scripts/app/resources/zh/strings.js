define(["require", "exports"], function (require, exports) {
    exports.strings = {
        language: "zh",
        locale: "zh-CN",
        app: {
            general: {
                required: "Required",
                requiredField: "必填字段",
                busy: "请稍等。。。",
                submitButton: "Submit",
                cancelButton: "Cancel"
            },
            dashboard: {
                title: "仪表盘",
                activeThread: "论坛讨论",
                activeForum: "论坛话题",
                forumTitle: "Forums",
                noForum: "No forum found",
                noTopic: "No discussion topic found",
                noThread: "No discussion thread found"
            },
            services: {
                user: {
                    getCurrentUserError: "无法读取当前用户信息: {{error}}"
                }
            },
            topnav: {
                hostWeb: "Quick Discussion",
                admin: "管理",
                home: "门户",                
                userPosts: "论坛帖",
                language: {
                    main: "语言",
                    english: "英语",
                    chinese: "中文",
                    auto: "自动模式"
                },
                customization: "Customization",
                manageForum: "管理论坛",
                returnToSite: "回到SharePoint网站",
                about: {
                    title: "关于",
                    okButton: "关闭"
                },
                tooltip: {
                    addYourOwn: "加入个人设计"
                },
                search: {
                    title: "搜索",
                    go: "搜索!"
                }
            },
            search: {
                result: "搜索结果",
                searchForum: "Search forum...",
                searchThread: "Search thread...",
                titleHeader: "Title",
                summaryHeader: "Summary",
                authorHeader: "Author"
            },
            customization: {
                invalidSettings: "无法读取交流网站设置: {{error}}",
                loggingLevelApplied: "Successfully applied the logging level: {{level}}"
            },
            forum: {
                title: "论坛",
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
                    newForum: "创建论坛",
                    edit: "Edit Forum",
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
                title: "New Thread",
                subject: "Subject",
                message: "Message",
                bodyRequired: "Required!",
                subjectRequired: 'Required!',
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
