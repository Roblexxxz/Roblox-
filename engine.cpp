// engine.cpp
#include <emscripten/bind.h>

class CharacterPhysics {
public:
    // High-performance position calculation
    float move(float currentPos, float speed, float dt) {
        return currentPos + (speed * dt);
    }
};

EMSCRIPTEN_BINDINGS(phys_module) {
    emscripten::class_<CharacterPhysics>("CharacterPhysics")
        .constructor<>()
        .function("move", &CharacterPhysics::move);
}
