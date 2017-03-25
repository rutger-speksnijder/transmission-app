/**
 * Torrent helper class.
 *
 * @author Rutger Speksnijder.
 * @since TransmissionApp 1.0.0.
 */
angular.module('transmission').factory('TorrentHelper', function()
{
    return {
        sizes: [
            'b',
            'kb',
            'mb',
            'gb',
            'tb'
        ],
        getReadableEta: function(eta)
        {
            // Check if the eta is below zero. Eta is -1 when torrents are paused.
            if (eta < 0) {
                return 'n/a';
            }

            // Calculate and subtract whole days
            var days = Math.floor(eta / 86400);
            eta -= days * 86400;

            // Calculate and subtract whole hours
            var hours = Math.floor(eta / 3600) % 24;
            eta -= hours * 3600;

            // Calculate and subtract whole minutes
            var minutes = Math.floor(eta / 60) % 60;
            eta -= minutes * 60;

            // Calculate whole seconds
            var seconds = eta % 60;

            // Create the string
            var text = '';
            if (days > 0) {
                if (days > 1) {
                    text += days + ' days, ';
                } else {
                    text += '1 day, ';
                }
            }
            if (hours > 0) {
                if (hours > 1) {
                    text += hours + ' hours, ';
                } else {
                    text += '1 hour, ';
                }
            }
            if (minutes > 0) {
                if (minutes > 1) {
                    text += minutes + ' minutes, ';
                } else {
                    text += '1 minute, ';
                }
            }
            if (seconds > 0) {
                if (seconds > 1) {
                    text += seconds + ' seconds';
                } else {
                    text += '1 second';
                }
            }

            // Check if the string ends with a comma and a space, and remove those.
            if (text.indexOf(', ') === text.length - 2) {
                text = text.substr(0, text.length - 2);
            }

            // Return the string
            return text;
        },
        bytesToReadableSize: function(bytes)
        {
            // Check if the bytes argument is set
            if (!bytes) {
                return '0 b';
            }

            // Calculate the size
            var sizeIndex = parseInt((Math.floor(Math.log(bytes) / Math.log(1024))));
            return Math.round(bytes / Math.pow(1024, sizeIndex), 2) + ' ' + this.sizes[sizeIndex];
        },
        bytesToReadableSpeed: function(speed)
        {
            return this.bytesToReadableSize(speed) + '/s';
        },
        getProgressClass: function(percentDone)
        {
            if (percentDone < 10) {
                return 'assertive';
            } else if (percentDone >= 10 && percentDone < 40) {
                return 'assertive';
            } else if (percentDone >= 40 && percentDone < 80) {
                return 'energized';
            } else if (percentDone >= 80 && percentDone < 100) {
                return 'balanced';
            } else {
                return 'positive';
            }
        },
    };
});
