
package com.helpdesk.service;

import com.helpdesk.model.Ticket;
import com.helpdesk.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public Optional<Ticket> updateTicket(Long id, Ticket updatedTicket) {
        return ticketRepository.findById(id)
                .map(existingTicket -> {
                    existingTicket.setTitle(updatedTicket.getTitle());
                    existingTicket.setDescription(updatedTicket.getDescription());
                    existingTicket.setCategory(updatedTicket.getCategory());
                    existingTicket.setPriority(updatedTicket.getPriority());
                    existingTicket.setStatus(updatedTicket.getStatus());

                    return ticketRepository.save(existingTicket);
                });
    }

    public boolean deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            return false;
        }

        ticketRepository.deleteById(id);
        return true;
    }
}
