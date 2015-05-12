'use strict';
window.SP = {
    PermissionKind: {
        emptyMask: 0,
        /** View items in lists, documents in document libraries, and view Web discussion comments. */
        viewListItems: 1,
        /** Add items to lists, add documents to document libraries, and add Web discussion comments. */
        addListItems: 2,
        /** Edit items in lists, edit documents in document libraries, edit Web discussion comments in documents, and customize Web Part Pages in document libraries. */
        editListItems: 3,
        /** Delete items from a list, documents from a document library, and Web discussion comments in documents. */
        deleteListItems: 4,
        /** Approve a minor version of a list item or document. */
        approveItems: 5,
        /** View the source of documents with server-side file handlers. */
        openItems: 6,
        /** View past versions of a list item or document. */
        viewVersions: 7,
        /** Delete past versions of a list item or document. */
        deleteVersions: 8,
        /** Discard or check in a document which is checked out to another user. */
        cancelCheckout: 9,
        /** Create, change, and delete personal views of lists. */
        managePersonalViews: 10,
        /** Create and delete lists, add or remove columns in a list, and add or remove public views of a list. */
        manageLists: 11,
        /** View forms, views, and application pages, and enumerate lists. */
        viewFormPages: 12,
        /** Make content of a list or document library retrieveable for anonymous users through SharePoint search. The list permissions in the site do not change.  */
        anonymousSearchAccessList: 13,
        /** Allow users to open a Web site, list, or folder to access items inside that container. */
        open: 14,
        /** View pages in a Web site. */
        viewPages: 15,
        /** Add, change, or delete HTML pages or Web Part Pages, and edit the Web site using a SharePoint Foundation?compatible editor. */
        addAndCustomizePages: 16,
        /** Apply a theme or borders to the entire Web site. */
        applyThemeAndBorder: 17,
        /** Apply a style sheet (.css file) to the Web site. */
        applyStyleSheets: 18,
        /** View reports on Web site usage. */
        viewUsageData: 19,
        /** Create a Web site using Self-Service Site Creation. */
        createSSCSite: 20,
        /** Create subsites such as team sites, Meeting Workspace sites, and Document Workspace sites.  */
        manageSubwebs: 21,
        /** Create a group of users that can be used anywhere within the site collection. */
        createGroups: 22,
        /** Create and change permission levels on the Web site and assign permissions to users and groups. */
        managePermissions: 23,
        /** Enumerate files and folders in a Web site using Microsoft Office SharePoint Designer 2007 and WebDAV interfaces. */
        browseDirectories: 24,
        /** View information about users of the Web site. */
        browseUserInfo: 25,
        /** Add or remove personal Web Parts on a Web Part Page. */
        addDelPrivateWebParts: 26,
        /** Update Web Parts to display personalized information. */
        updatePersonalWebParts: 27,
        /** Grant the ability to perform all administration tasks for the Web site as well as manage content. Activate, deactivate, or edit properties of Web site scoped Features through the object model or through the user interface (UI). When granted on the root Web site of a site collection, activate, deactivate, or edit properties of site collection scoped Features through the object model. To browse to the Site Collection Features page and activate or deactivate site collection scoped Features through the UI, you must be a site collection administrator. */
        manageWeb: 28,
        /** Content of lists and document libraries in the Web site will be retrieveable for anonymous users through SharePoint search if the list or document library has AnonymousSearchAccessList set.  */
        anonymousSearchAccessWebLists: 29,
        /** Use features that launch client applications; otherwise, users must work on documents locally and upload changes.  */
        useClientIntegration: 30,
        /** Use SOAP, WebDAV, or Microsoft Office SharePoint Designer 2007 interfaces to access the Web site. */
        useRemoteAPIs: 31,
        /** Manage alerts for all users of the Web site. */
        manageAlerts: 32,
        /** Create e-mail alerts. */
        createAlerts: 33,
        /** Allows a user to change his or her user information, such as adding a picture. */
        editMyUserInfo: 34,
        /** Enumerate permissions on the Web site, list, folder, document, or list item. */
        enumeratePermissions: 35,
        /** Has all permissions on the Web site. Not available through the user interface. */
        fullMask: 36
    },

    BasePermissions: (function() {
        function BasePermissions() {}
        BasePermissions.prototype.has = function (perm){
            if (this.data.High <= '176' &&
                this.data.Low >= '138612833')
                return false;
            else
                return true;
        }
        BasePermissions.prototype.fromJson = function (data) {
            this.data = data;
            return new BasePermissions();
        }
        return BasePermissions;
    })()
};
