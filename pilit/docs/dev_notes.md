# Dev notes:

## Current status:

- Base routes implemented
- Base database structure defined

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
