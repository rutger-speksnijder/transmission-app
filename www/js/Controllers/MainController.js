angular.module('transmission')
.controller('MainController', function($ionicPlatform, $scope, $ionicPopover, $ionicPopup, $http, ApiClient, TorrentHelper)
{
    // Set the api client's url to the settings url
    ApiClient.apiUrl = window.localStorage.getItem('api-url');

    // Initialize the scope
    $scope.TorrentHelper = TorrentHelper;
    $scope.selectionMode = false;
    $scope.torrents = [];
    $scope.apiUrl = ApiClient.apiUrl;

    /**
     * Updates the scope with the current array of torrents.
     * @return void.
     */
    var updateTorrents = function()
    {
        // Don't update if selection mode is enabled
        if ($scope.selectionMode) {
            return;
        }

        // Check if the api url is set
        if (!ApiClient.apiUrl.length) {
            // Empty the torrents
            $scope.torrents = [];
            return;
        }

        // Get the torrents
        var torrentsResult = ApiClient.getTorrents();
        if (torrentsResult) {
            torrentsResult.then(function(response) {
                $scope.torrents = response.torrents;
            });
        } else {
            $scope.torrents = [];
        }
    };

    // Set an interval to keep updating the view
    var updateTorrentsInterval = null;

    // Build the menu
    $ionicPopover.fromTemplateUrl('views/menu.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.menu = popover;
    });

    /**
     * Method that gets executed when the application is ready or resumed.
     * Resumed means when the user switched to another app and then switched back to this app.
     * @return void.
     */
    var applicationReady = function() {
        // Update the torrents
        updateTorrents();

        // Set the update interval if it's null
        // - This is done so that the interval resumes when the app is resumed,
        // - because we kill the interval on pause.
        if (updateTorrentsInterval == null) {
            updateTorrentsInterval = setInterval(updateTorrents, 3000);
        }

        // Setting a timeout for 1 second seems to be enough for the handleOpenURL method to be loaded
        setTimeout(function() {
            // Check if the received-url is set in the local storage
            if (window.localStorage.getItem('received-url')) {
                // Add the torrent
                ApiClient.addMagnet(window.localStorage.getItem('received-url')).then(
                    function(response) {
                        // Check if the response is an error message, if so, show it.
                        if (response.status > 200 && response.data && response.data.message) {
                            alert(response.data.message);
                        }
                    }
                );

                // Remove the url
                window.localStorage.removeItem('received-url');
            }
        }, 1000);
    };

    // Bind the ready and resume events to the load function
    $ionicPlatform.ready(applicationReady);
    $ionicPlatform.on('resume', applicationReady);

    /**
     * Method that gets executed when the application pauses.
     * Pause means when the user switches to another app.
     * @return void.
     */
    var applicationPause = function()
    {
        // Clear the update torrents interval,
        // so that we don't use unnecessary data in the background.
        clearInterval(updateTorrentsInterval);
        updateTorrentsInterval = null;
    };

    // Bind the pause event to the pause function
    $ionicPlatform.on('pause', applicationPause);

    /**
     * Enables the selection mode.
     * @param int index The index of the selected torrent.
     * @return void.
     */
    $scope.enableSelectionMode = function (index) {
        // Check if the selection mode isn't enabled
        if (!$scope.selectionMode) {
            // Enable selection mode and set the torrent that was held down to selected
            $scope.selectionMode = true;
            $scope.torrents[index].selected = true;
        }
    };

    /**
     * Selects a torrent.
     * @param int index The index of the torrent to select.
     * @return void.
     */
    $scope.selectTorrent = function (index) {
        // Check if the selection mode is enabled
        if (!$scope.selectionMode) {
            return;
        }

        // Toggle the torrent's selection state
        $scope.torrents[index].selected = !$scope.torrents[index].selected;

        // Check if there's any torrent selected
        var selected = false;
        for (var i = 0; i < $scope.torrents.length; i++) {
            if ($scope.torrents[i].selected) {
                selected = true;
                break;
            }
        }

        // Disable selection mode if all torrents are deselected
        if (!selected) {
            $scope.selectionMode = false;
        }
    };

    /**
     * Handles adding a torrent.
     * @return void.
     */
    $scope.addTorrent = function()
    {
        // Close the menu
        $scope.menu.hide();

        // Set an object to hold the new uri
        $scope.magnetData = {};

        // Create the ionic popup
        var addMagnetPopup = $ionicPopup.show({
            templateUrl: 'views/add-magnet.html',
            title: 'Enter a magnet uri',
            subTitle: '',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Add</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        return $scope.magnetData.uri;
                    }
                }
            ]
        });

        // Triggers when the popup is closed
        addMagnetPopup.then(function(magnetUri) {
            // Add the torrent
            if (magnetUri) {
                ApiClient.addMagnet(magnetUri).then(function(response) {
                    // Check the response
                    if (response.status > 200 && response.data && response.data.message) {
                        alert(response.data.message);
                    }
                });
                updateTorrents();
            }
        });
    };

    /**
     * Handles changing the settings.
     * @return void.
     */
    $scope.changeSettings = function()
    {
        // Close the menu
        $scope.menu.hide();

        // Set an object to hold the new url
        $scope.apiData = {
            url: window.localStorage.getItem('api-url'),
        };

        // Create the ionic popup
        var settingsPopup = $ionicPopup.show({
            templateUrl: 'views/settings.html',
            title: 'Enter the api url',
            subTitle: '',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        return $scope.apiData.url;
                    }
                }
            ]
        });

        // Triggers when the popup is closed
        settingsPopup.then(function(url) {
            // Check if the user entered a url
            if (!url) {
                // Clear the api url
                window.localStorage.setItem('api-url', '');
                ApiClient.apiUrl = '';
                $scope.torrents = [];
                return;
            }

            // Check if the url starts with http:// or https://
            if (url.toString().indexOf('http') !== 0) {
                url = 'http://' + url;
            }

            // Check if the url ends with a forward slash
            if (url.indexOf('/') === (url.length - 1)) {
                url = url.substr(0, url.length - 1);
            }

            // Store the url in the local storage
            window.localStorage.setItem('api-url', url);

            // Set the API client's url
            ApiClient.apiUrl = url;
        });
    };

    /**
     * Gets the selected torrents.
     * @return void.
     */
    $scope.getSelectedTorrents = function()
    {
        // Get the selected torrents
        var selected = [];
        for (var i = 0; i < $scope.torrents.length; i++) {
            if ($scope.torrents[i].selected) {
                selected.push(i);
            }
        }

        // Return the indices
        return selected;
    };

    /**
     * Starts the specified torrents.
     * @param array indices The indices of torrents to start.
     * @return void.
     */
    $scope.startTorrents = function(indices)
    {
        // Toggle selection mode off
        $scope.selectionMode = false;

        // Set the confirmation message
        var message = 'Do you want to start this torrent immediately regardless of queue?';
        if (indices.length > 1) {
            message = 'Do you want to start these torrents immediately regardless of queue?';
        }

        // Show a confirmation popup
        var confirmPopup = $ionicPopup.confirm({
            title: 'Start immediately',
            template: message,
            'cancelText': 'No',
            'okText': 'Yes',
        });
        confirmPopup.then(function(res) {
            for (var i = 0; i < indices.length; i++) {
                ApiClient.startTorrent($scope.torrents[i].id, res);
            }
            updateTorrents();
        });
    };

    /**
     * Stops the specified torrents.
     * @param array indices The indices of torrents to stop.
     * @return void.
     */
    $scope.stopTorrents = function(indices)
    {
        // Toggle selection mode off
        $scope.selectionMode = false;

        // Stop the torrents
        for (var i = 0; i < indices.length; i++) {
            ApiClient.stopTorrent($scope.torrents[i].id);
        }
        updateTorrents();
    };

    /**
     * Verifies the specified torrents.
     * @param array indices The indices of torrents to recheck.
     * @return void.
     */
    $scope.verifyTorrents = function(indices)
    {
        // Toggle selection mode off
        $scope.selectionMode = false;

        // Verify the torrents
        for (var i = 0; i < indices.length; i++) {
            ApiClient.verifyTorrent($scope.torrents[i].id);
        }
        updateTorrents();
    };

    /**
     * Deletes the specified torrents.
     * @param array indices The indices of torrents to delete.
     * @return void.
     */
    $scope.deleteTorrents = function(indices)
    {
        // Check if the user is sure
        var message = 'Are you sure you want to delete this torrent?';
        if (indices.length > 1) {
            message = 'Are you sure you want to delete these torrents?';
        }

        // Show a confirmation popup
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete torrents',
            template: message,
            'cancelText': 'No',
            'okText': 'Yes',
        });
        confirmPopup.then(function(res) {
            if (!res) {
                return;
            }

            // Toggle selection mode off
            $scope.selectionMode = false;

            // Set the confirmation message
            message = 'Do you want to delete the files associated with this torrent as well?';
            if (indices.length > 1) {
                message = 'Do you want to delete the files associated with these torrents as well?';
            }

            // Show a confirmation popup
            var confirmPopup2 = $ionicPopup.confirm({
                title: 'Delete files',
                template: message,
                'cancelText': 'No',
                'okText': 'Yes',
            });
            confirmPopup2.then(function(res) {
                for (var i = 0; i < indices.length; i++) {
                    ApiClient.deleteTorrent($scope.torrents[i].id, res);
                }
                updateTorrents();
            });
        });
    };

    /**
     * Closes the app.
     * @return void.
     */
    $scope.exitApp = function()
    {
        // Exit the app
        ionic.Platform.exitApp();
    };
});
