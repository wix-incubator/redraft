## 0.4.0
- added support for blocks with depth
- block renderer now receives a second argument - depth

## 0.3.0
- redraft now has a default export
- directly importing renderRaw is now deprecated
- renderers should now be provided in a single object as a second argument
- added warnings for all deprecated calls in non production
- updated readme to reflect the changes

## 0.2.4
- fixes blocks with content length=1 do not display #1

## 0.2.3
- some cleanup and dropped lodash as a dependency

## 0.2.2
- rewrite of the nodeIterator and pushContent methods

## 0.2.1
- few less iterations of RawParser
- strings are concatenated inside ContentNode

## 0.2.0
- Added basic entity parsing and the ContentNode class
- Minor fixes
