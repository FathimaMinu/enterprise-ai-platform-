package com.enterpriseai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long   totalEmployees;
    private long   totalDocuments;
    private long   totalChats;
    private long   aiQueriesToday;
    private double costSaved;
}
