# Dev notes:

## Current status:

API:

- Base routes implemented
- Base database structure defined

Front End:

- In-progress:
  - Retrieve list of shows from API
  - Retrieve a show blob from API and populate state
    LEFT OFF HERE: I may need to implement the full animation type / channel type stuff on the backend. Or, I'll need to create a mapping from the types defined in the front-end to their IDs which are stored on the server.
    From there, I'm populating the state.channels and show vars but the channels aren't being rendered. Find and fix.

### Next steps:

- (Maybe) Add routes to pull a "joined" set of data representing a show (all channels, clips, etc.)
- Update front-end to interact with API rather than LocalStorage data
  - Add controls to handle specifying server address, add/edit shows, add/edit schedules

## dynamically create channel types

Assuming:

- a channel type corresponds to a node, and
- all nodes accept and process a JSON payload, and
- for each node, that JSON payload can be explicitly defined

We can create a means in the app where the user can specify the JSON schema for a channel type and from that, auto-generate a UI to enter the params that would populate that schema.

Challenges:

- how to define the various input field types and the data to back them. For example, if a node expects an animation name that exists within a known set of names, how would we specify that?

Possible, use JSONSchema format to define the set of animation params, acceptable values, defaults, etc.
