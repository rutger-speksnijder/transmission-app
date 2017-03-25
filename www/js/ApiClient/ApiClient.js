/**
 * Api client class.
 *
 * @author Rutger Speksnijder.
 * @since TransmissionApp 1.0.0.
 */
angular.module('transmission').factory('ApiClient', function($http)
{
    return {
        // The api url
        apiUrl: '',

        /**
         * Gets all torrents from the server.
         * @return array The response.
         */
        getTorrents: function()
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'GET',
                url: this.apiUrl + '/torrent?minimal=1',
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },

        /**
         * Adds a torrent.
         * @param string uri The magnet uri.
         * @return array The response.
         */
        addMagnet: function(uri)
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'POST',
                data: { uri: uri },
                url: this.apiUrl + '/torrent',
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },

        /**
         * Starts a torrent.
         * @param int id The torrent's id.
         * @param boolean immediately Whether to start the torrent immediately regardless of queue.
         * @return array The response.
         */
        startTorrent: function(id, immediately)
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'GET',
                data: { immediately: immediately ? 1 : 0 },
                url: this.apiUrl + '/torrent/' + id + '/start',
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },

        /**
         * Stops a torrent.
         * @param int id The torrent's id.
         * @return array The response.
         */
        stopTorrent: function(id)
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'GET',
                url: this.apiUrl + '/torrent/' + id + '/stop',
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },

        /**
         * Verifies a torrent.
         * @param int id The torrent's id.
         * @return array The response.
         */
        verifyTorrent: function(id)
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'GET',
                url: this.apiUrl + '/torrent/' + id + '/verify',
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },

        /**
         * Deletes a torrent.
         * @param int id The torrent's id.
         * @param boolean deleteFiles Whether to delete files as well.
         * @return void.
         */
        deleteTorrent: function(id, deleteFiles)
        {
            // Check the api url
            if (!this.apiUrl.length) {
                return null;
            }

            return $http({
                method: 'DELETE',
                url: this.apiUrl + '/torrent/' + id + '?files=' + (deleteFiles ? '1' : '0'),
            }).then(function(response) {
                return response.data;
            }).catch(function(error) {
                return error;
            });
        },
    };
});
