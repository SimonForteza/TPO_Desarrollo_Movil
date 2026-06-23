package com.example.backend.subastas.util;

import com.example.backend.shared.exception.BusinessRuleException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum Categoria {
    COMUN("comun", 1),
    ESPECIAL("especial", 2),
    PLATA("plata", 3),
    ORO("oro", 4),
    PLATINO("platino", 5);

    private final String dbValue;
    private final int rank;

    Categoria(String dbValue, int rank) {
        this.dbValue = dbValue;
        this.rank = rank;
    }

    public String getDbValue() {
        return dbValue;
    }

    public int getRank() {
        return rank;
    }

    public static Categoria from(String value) {
        return Arrays.stream(values())
                .filter(c -> c.dbValue.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("Unknown category: " + value));
    }

    public static List<String> allowedFor(String userCategoria) {
        int maxRank = from(userCategoria).rank;
        return Arrays.stream(values())
                .filter(c -> c.rank <= maxRank)
                .map(Categoria::getDbValue)
                .collect(Collectors.toList());
    }

    public boolean canAccess(String subastaCategoria) {
        return this.rank >= from(subastaCategoria).rank;
    }
}
