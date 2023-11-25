        IN CLOUD FUNCTIONS:
        1. Every day, in every timezone, check if there's a new or full moon.
        If there is, update a data object with the timezone as a key and an
        object with sunrise and sunset data as the value.

        2. Take this data object and scan through the users db, filtering out
        all users that match the relevant timezones

        {
            // timezone in hours from UTC
            -8: {
                sunrise: "06:12:34",
                sunset: "18:43:21",
                users: [
                    {subscription, goals},
                    ...
                ],
            },
            ...
        }

        Users need to provide a notification time and their location.
        Both these can be updated in settings.

        // Every hour, a cloud function should update next_times for each user
        // in the database. If it's the user-set time in that person's timezone
        // on the day of next_times, and next_times !== last times,
        // push the data to the user's phone
